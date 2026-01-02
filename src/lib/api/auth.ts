import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface ApiUser {
  id: string;
  tier: 'free' | 'pro' | 'business';
  keyHash: string; // Added to track which key was used
}

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per key
const MONTHLY_REQUEST_LIMIT = 10000; // 10,000 requests per month

// In-memory rate limiter with fallback
// Note: This resets on server restart - acceptable for per-minute limits
// Monthly limits are enforced via database
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check per-minute rate limit for an API key
 */
function checkRateLimit(keyHash: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(keyHash);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(keyHash, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

// Clean up old rate limit entries periodically (only in long-running processes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

/**
 * Validate API key and return user info
 */
export async function validateApiKey(
  authHeader: string | null,
  clientIp?: string
): Promise<{
  user: ApiUser | null;
  rateLimitInfo?: { allowed: boolean; remaining: number; resetAt: number };
  monthlyLimitExceeded?: boolean;
}> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey) return { user: null };

  // Hash the key
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Check per-minute rate limit first
  const rateLimitInfo = checkRateLimit(keyHash);
  if (!rateLimitInfo.allowed) {
    return { user: null, rateLimitInfo };
  }

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find the API key with all constraints including monthly usage
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('user_id, expires_at, ip_whitelist, permissions, monthly_request_count, monthly_reset_at')
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .single();

  if (keyError || !keyData) {
    return { user: null, rateLimitInfo };
  }

  // Check expiration
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { user: null, rateLimitInfo };
  }

  // Check IP whitelist if configured
  if (keyData.ip_whitelist && keyData.ip_whitelist.length > 0 && clientIp) {
    const allowed = keyData.ip_whitelist.some((ip: string) => {
      return ip === clientIp || ip === '*';
    });
    if (!allowed) {
      return { user: null, rateLimitInfo };
    }
  }

  // Check and reset monthly counter if needed
  const now = new Date();
  const monthlyResetAt = keyData.monthly_reset_at ? new Date(keyData.monthly_reset_at) : null;
  let currentMonthlyCount = keyData.monthly_request_count || 0;

  // Reset monthly counter if we're in a new month
  if (!monthlyResetAt || monthlyResetAt < now) {
    currentMonthlyCount = 0;
    // Set reset date to first of next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await supabase
      .from('api_keys')
      .update({
        monthly_request_count: 0,
        monthly_reset_at: nextMonth.toISOString(),
        last_used_at: now.toISOString()
      })
      .eq('key_hash', keyHash)
      .eq('user_id', keyData.user_id); // Defense in depth: verify ownership
  }

  // Check monthly limit
  if (currentMonthlyCount >= MONTHLY_REQUEST_LIMIT) {
    return { user: null, rateLimitInfo, monthlyLimitExceeded: true };
  }

  // Get user tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', keyData.user_id)
    .single();

  const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';

  // Only business tier can use API
  if (tier !== 'business') {
    return { user: null, rateLimitInfo };
  }

  return {
    user: {
      id: keyData.user_id,
      tier,
      keyHash, // Return keyHash so we can increment counts later
    },
    rateLimitInfo,
  };
}

/**
 * Increment request count for an API key
 * Call this after a successful API operation
 */
export async function incrementRequestCount(keyHash: string): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get current counts
  const { data } = await supabase
    .from('api_keys')
    .select('request_count, monthly_request_count')
    .eq('key_hash', keyHash)
    .single();

  if (data) {
    // Increment both counts
    await supabase
      .from('api_keys')
      .update({
        request_count: (data.request_count || 0) + 1,
        monthly_request_count: (data.monthly_request_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('key_hash', keyHash);
  }
}

/**
 * Monthly limit exceeded error response
 */
export function monthlyLimitError() {
  return new Response(JSON.stringify({
    error: 'Monthly request limit exceeded',
    message: 'You have exceeded your monthly API request limit of 10,000 requests. Limits reset on the first of each month.',
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Monthly-Limit': String(MONTHLY_REQUEST_LIMIT),
      'X-RateLimit-Monthly-Remaining': '0',
    },
  });
}

/**
 * Generate a new API key
 * Returns both the key (to show once) and hash (to store)
 */
export function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  // Generate 32 random bytes
  const randomBytes = crypto.randomBytes(32);
  const key = `qrw_${randomBytes.toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const keyPrefix = key.slice(0, 8); // Must be 8 chars or less for DB column

  return { key, keyHash, keyPrefix };
}

/**
 * API error response helper
 */
export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

/**
 * API success response helper
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return Response.json({ data }, { status });
}

/**
 * Rate limit error response with headers
 */
export function rateLimitError(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    },
  });
}

// Input validation helpers
export const validators = {
  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  },

  isValidContentType(type: string): boolean {
    const validTypes = [
      // Basic types
      'url', 'text', 'wifi', 'vcard', 'email', 'phone', 'sms',
      // Simple URL types
      'whatsapp', 'facebook', 'instagram', 'apps',
      // File upload types
      'pdf', 'images', 'video', 'mp3',
      // Landing page types
      'menu', 'business', 'links', 'coupon', 'social',
    ];
    return validTypes.includes(type);
  },

  isValidQRType(type: string): boolean {
    return ['static', 'dynamic'].includes(type);
  },

  isValidErrorCorrectionLevel(level: string): boolean {
    return ['L', 'M', 'Q', 'H'].includes(level);
  },

  sanitizeFilename(name: string): string {
    // Remove any path traversal attempts and dangerous characters
    return name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid filename chars
      .replace(/\.\./g, '') // Remove path traversal
      .slice(0, 100); // Limit length
  },

  isValidISODate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  },

  validateStringLength(str: string, maxLength: number): boolean {
    return typeof str === 'string' && str.length <= maxLength;
  },

  // Content validation helpers for each content type
  validateContent(content: Record<string, unknown>, contentType: string): { valid: boolean; error?: string } {
    switch (contentType) {
      case 'url':
        if (!content.url || typeof content.url !== 'string') {
          return { valid: false, error: 'content.url is required for URL type' };
        }
        if (!validators.isValidUrl(content.url)) {
          return { valid: false, error: 'Invalid URL. Must start with http:// or https://' };
        }
        break;

      case 'text':
        if (!content.text || typeof content.text !== 'string') {
          return { valid: false, error: 'content.text is required for text type' };
        }
        break;

      case 'wifi':
        if (!content.ssid || typeof content.ssid !== 'string') {
          return { valid: false, error: 'content.ssid is required for WiFi type' };
        }
        if (content.encryption && !['WPA', 'WEP', 'nopass'].includes(content.encryption as string)) {
          return { valid: false, error: 'content.encryption must be WPA, WEP, or nopass' };
        }
        break;

      case 'vcard':
        // vCard requires at least a name
        if (!content.firstName && !content.lastName && !content.organization) {
          return { valid: false, error: 'vCard requires firstName, lastName, or organization' };
        }
        break;

      case 'email':
        if (!content.address || typeof content.address !== 'string') {
          return { valid: false, error: 'content.address is required for email type' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.address)) {
          return { valid: false, error: 'Invalid email address format' };
        }
        break;

      case 'phone':
      case 'sms':
        if (!content.number || typeof content.number !== 'string') {
          return { valid: false, error: `content.number is required for ${contentType} type` };
        }
        break;

      case 'whatsapp':
        if (!content.number || typeof content.number !== 'string') {
          return { valid: false, error: 'content.number is required for WhatsApp type' };
        }
        break;

      // URL-based social types
      case 'facebook':
      case 'instagram':
      case 'apps':
        if (content.url && typeof content.url === 'string' && !validators.isValidUrl(content.url)) {
          return { valid: false, error: 'Invalid URL format' };
        }
        break;

      // File/landing page types - more permissive
      case 'pdf':
      case 'images':
      case 'video':
      case 'mp3':
      case 'menu':
      case 'business':
      case 'links':
      case 'coupon':
      case 'social':
        // These are more complex types, basic validation only
        break;

      default:
        return { valid: false, error: `Unknown content type: ${contentType}` };
    }

    return { valid: true };
  },
};
