import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface ApiUser {
  id: string;
  tier: 'free' | 'pro' | 'business';
}

// In-memory rate limiter (upgrade to Redis for production scale)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per key

/**
 * Check rate limit for an API key
 * Returns true if request should be allowed, false if rate limited
 */
function checkRateLimit(keyHash: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(keyHash);

  if (!entry || entry.resetAt < now) {
    // Reset or create new window
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

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Validate API key and return user info
 */
export async function validateApiKey(
  authHeader: string | null,
  clientIp?: string
): Promise<{ user: ApiUser | null; rateLimitInfo?: { allowed: boolean; remaining: number; resetAt: number } }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey) return { user: null };

  // Hash the key
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Check rate limit first
  const rateLimitInfo = checkRateLimit(keyHash);
  if (!rateLimitInfo.allowed) {
    return { user: null, rateLimitInfo };
  }

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find the API key with all constraints
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('user_id, expires_at, ip_whitelist, permissions')
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
      // Support CIDR notation in the future, for now exact match
      return ip === clientIp || ip === '*';
    });
    if (!allowed) {
      return { user: null, rateLimitInfo };
    }
  }

  // Update last used
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash);

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
    },
    rateLimitInfo,
  };
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
};
