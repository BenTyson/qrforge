import crypto from 'crypto';
import { createAdminClient } from '@/lib/admin/auth';
import type { WebhookPayload, WebhookConfig } from './types';

const WEBHOOK_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BODY_LENGTH = 1024; // 1KB

// Retry delays in seconds: 30s, 2m, 15m, 1h, 4h
const RETRY_DELAYS = [30, 120, 900, 3600, 14400];

/**
 * Generate a cryptographically secure webhook signing secret
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sign a webhook payload with HMAC-SHA256
 */
export function signPayload(payload: string, secret: string, timestamp: number): string {
  const data = `${timestamp}.${payload}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Calculate the delay before the next retry attempt
 */
export function calculateNextRetry(attempt: number): Date {
  const delaySeconds = RETRY_DELAYS[Math.min(attempt - 1, RETRY_DELAYS.length - 1)] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
  return new Date(Date.now() + delaySeconds * 1000);
}

/**
 * Look up webhook config for a QR code. Returns null if no active webhook configured.
 * This is the fast path — indexed SELECT returning 0 rows for 99%+ of scans.
 */
export async function lookupWebhookConfig(qrCodeId: string): Promise<WebhookConfig | null> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('webhook_configs')
    .select('*')
    .eq('qr_code_id', qrCodeId)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as WebhookConfig;
}

/**
 * Build the webhook payload from scan and QR code data
 */
export function buildWebhookPayload(
  deliveryId: string,
  scanId: string,
  scanData: {
    scanned_at: string;
    device_type: string | null;
    os: string | null;
    browser: string | null;
    country: string | null;
    city: string | null;
    region: string | null;
  },
  qrCodeData: {
    id: string;
    name: string;
    short_code: string | null;
    content_type: string;
  }
): WebhookPayload {
  return {
    event: 'scan',
    timestamp: new Date().toISOString(),
    delivery_id: deliveryId,
    qr_code: {
      id: qrCodeData.id,
      name: qrCodeData.name,
      short_code: qrCodeData.short_code,
      content_type: qrCodeData.content_type,
    },
    scan: {
      id: scanId,
      scanned_at: scanData.scanned_at,
      device_type: scanData.device_type,
      os: scanData.os,
      browser: scanData.browser,
      country: scanData.country,
      city: scanData.city,
      region: scanData.region,
    },
  };
}

/**
 * Deliver a webhook for a specific delivery record.
 * Updates the delivery row with the result.
 */
export async function deliverWebhook(deliveryId: string): Promise<boolean> {
  const adminClient = createAdminClient();

  // Fetch delivery with config
  const { data: delivery, error: fetchError } = await adminClient
    .from('webhook_deliveries')
    .select('*, webhook_configs(url, secret)')
    .eq('id', deliveryId)
    .single();

  if (fetchError || !delivery) {
    console.error('[Webhook] Delivery not found:', deliveryId, fetchError?.message);
    return false;
  }

  const config = delivery.webhook_configs;
  if (!config) {
    console.error('[Webhook] Config not found for delivery:', deliveryId);
    await adminClient.from('webhook_deliveries').update({
      status: 'exhausted',
      error_message: 'Webhook config not found',
    }).eq('id', deliveryId);
    return false;
  }

  const payloadStr = JSON.stringify(delivery.payload);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signPayload(payloadStr, config.secret, timestamp);
  const attemptNumber = (delivery.attempt_number || 0) + 1;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'QRWolf-Webhooks/1.0',
        'X-QRWolf-Signature': `sha256=${signature}`,
        'X-QRWolf-Delivery-Id': deliveryId,
        'X-QRWolf-Event': delivery.event_type || 'scan',
        'X-QRWolf-Timestamp': String(timestamp),
      },
      body: payloadStr,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text().catch(() => '');
    const truncatedBody = responseBody.slice(0, MAX_RESPONSE_BODY_LENGTH);

    if (response.ok) {
      // Success
      await adminClient.from('webhook_deliveries').update({
        status: 'success',
        http_status: response.status,
        response_body: truncatedBody,
        attempt_number: attemptNumber,
        delivered_at: new Date().toISOString(),
        error_message: null,
      }).eq('id', deliveryId);
      return true;
    }

    // Client error (4xx except 429) — don't retry
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      await adminClient.from('webhook_deliveries').update({
        status: 'exhausted',
        http_status: response.status,
        response_body: truncatedBody,
        attempt_number: attemptNumber,
        error_message: `Client error: ${response.status} ${response.statusText}`,
      }).eq('id', deliveryId);
      return false;
    }

    // Server error (5xx) or 429 — schedule retry
    return await scheduleRetry(adminClient, deliveryId, attemptNumber, delivery.max_attempts, response.status, truncatedBody, `Server error: ${response.status} ${response.statusText}`);
  } catch (err) {
    // Network error or timeout
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return await scheduleRetry(adminClient, deliveryId, attemptNumber, delivery.max_attempts, null, null, errorMessage);
  }
}

async function scheduleRetry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  deliveryId: string,
  attemptNumber: number,
  maxAttempts: number,
  httpStatus: number | null,
  responseBody: string | null,
  errorMessage: string
): Promise<boolean> {
  if (attemptNumber >= maxAttempts) {
    await adminClient.from('webhook_deliveries').update({
      status: 'exhausted',
      http_status: httpStatus,
      response_body: responseBody,
      attempt_number: attemptNumber,
      error_message: errorMessage,
    }).eq('id', deliveryId);
    return false;
  }

  const nextRetry = calculateNextRetry(attemptNumber);
  await adminClient.from('webhook_deliveries').update({
    status: 'failed',
    http_status: httpStatus,
    response_body: responseBody,
    attempt_number: attemptNumber,
    error_message: errorMessage,
    next_retry_at: nextRetry.toISOString(),
  }).eq('id', deliveryId);
  return false;
}

/**
 * Enqueue a webhook delivery for a QR code scan.
 * Called from recordScan() — fire-and-forget.
 * For QR codes without webhooks, this returns immediately after one indexed SELECT.
 */
export async function enqueueWebhookDelivery(
  qrCodeId: string,
  scanId: string,
  scanData: {
    scanned_at: string;
    device_type: string | null;
    os: string | null;
    browser: string | null;
    country: string | null;
    city: string | null;
    region: string | null;
  },
  qrCodeData: {
    id: string;
    name: string;
    short_code: string | null;
    content_type: string;
  }
): Promise<void> {
  // Fast path: check if webhook is configured
  const config = await lookupWebhookConfig(qrCodeId);
  if (!config) return; // No webhook — 99%+ of scans exit here

  // Check if scan event is in the configured events
  if (!config.events.includes('scan')) return;

  const adminClient = createAdminClient();

  // Create delivery record (with a temporary payload, will be filled below)
  const { data: delivery, error: insertError } = await adminClient
    .from('webhook_deliveries')
    .insert({
      webhook_config_id: config.id,
      scan_id: scanId,
      event_type: 'scan',
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !delivery) {
    console.error('[Webhook] Failed to create delivery record:', insertError?.message);
    return;
  }

  // Build payload with delivery ID
  const payload = buildWebhookPayload(delivery.id, scanId, scanData, qrCodeData);

  // Update delivery with payload
  await adminClient.from('webhook_deliveries').update({
    payload,
  }).eq('id', delivery.id);

  // Fire first delivery attempt (don't await — fire-and-forget)
  deliverWebhook(delivery.id).catch(err => {
    console.error('[Webhook] First delivery attempt failed:', err);
  });
}

/**
 * Validate a webhook URL.
 * HTTPS required, reject private IPs (SSRF prevention).
 */
export function isValidWebhookUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // HTTPS only
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Webhook URL must use HTTPS' };
    }

    // Block localhost variations
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { valid: false, error: 'Webhook URL cannot point to localhost' };
    }

    // Block private IP ranges (SSRF prevention)
    const PRIVATE_IP_RANGES = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./, // link-local
      /^0\./,
      /^fc00:/i,     // IPv6 unique local
      /^fe80:/i,     // IPv6 link-local
    ];

    for (const pattern of PRIVATE_IP_RANGES) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'Webhook URL cannot point to private IP addresses' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
