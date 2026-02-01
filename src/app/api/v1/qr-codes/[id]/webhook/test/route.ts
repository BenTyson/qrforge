import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, apiSuccess, rateLimitError, monthlyLimitError, incrementRequestCount } from '@/lib/api/auth';
import { headers } from 'next/headers';
import { buildWebhookPayload, deliverWebhook } from '@/lib/webhooks/deliver';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/v1/qr-codes/:id/webhook/test
 * Send a test webhook with mock scan data
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo, monthlyLimitExceeded } = await validateApiKey(authHeader, clientIp);

  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

  if (monthlyLimitExceeded) {
    return monthlyLimitError();
  }

  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify QR code ownership and get details
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id, name, short_code, content_type')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!qrCode) {
    return apiError('QR code not found', 404);
  }

  // Fetch active webhook config
  const { data: config } = await supabase
    .from('webhook_configs')
    .select('id')
    .eq('qr_code_id', id)
    .eq('is_active', true)
    .single();

  if (!config) {
    return apiError('No active webhook configured for this QR code', 404);
  }

  // Create test delivery with mock scan data
  const mockScanData = {
    scanned_at: new Date().toISOString(),
    device_type: 'mobile',
    os: 'iOS',
    browser: 'Safari',
    country: 'United States',
    city: 'San Francisco',
    region: 'California',
  };

  const { data: delivery, error: insertError } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_config_id: config.id,
      scan_id: null,
      event_type: 'scan',
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !delivery) {
    return apiError('Failed to create test delivery', 500);
  }

  const payload = buildWebhookPayload(delivery.id, 'test-scan-id', mockScanData, qrCode);

  await supabase.from('webhook_deliveries').update({
    payload,
  }).eq('id', delivery.id);

  const success = await deliverWebhook(delivery.id);

  const { data: result } = await supabase
    .from('webhook_deliveries')
    .select('status, http_status, response_body, error_message')
    .eq('id', delivery.id)
    .single();

  await incrementRequestCount(user.keyHash);

  return apiSuccess({
    success,
    delivery_id: delivery.id,
    status: result?.status,
    http_status: result?.http_status,
    error_message: result?.error_message,
  });
}
