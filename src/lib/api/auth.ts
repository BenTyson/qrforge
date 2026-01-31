import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { checkRateLimit as checkDistributedRateLimit } from '@/lib/redis/rate-limiter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface ApiUser {
  id: string;
  tier: 'free' | 'pro' | 'business';
  keyHash: string; // Added to track which key was used
}

// Rate limit configuration (now defined in rate-limiter.ts)
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per key
const MONTHLY_REQUEST_LIMIT = 10000; // 10,000 requests per month

/**
 * Check per-minute rate limit for an API key
 * Uses distributed Redis rate limiting with graceful fallback to in-memory
 */
async function checkRateLimit(keyHash: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const result = await checkDistributedRateLimit(keyHash);
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
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

  // Check per-minute rate limit first (distributed with fallback)
  const rateLimitInfo = await checkRateLimit(keyHash);
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

// Private IP ranges that should be blocked for SSRF prevention
const PRIVATE_IP_RANGES = [
  /^127\./, // Localhost
  /^10\./, // Class A private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
  /^192\.168\./, // Class C private
  /^169\.254\./, // Link-local
  /^0\./, // Current network
  /^224\./, // Multicast
  /^240\./, // Reserved
  /^::1$/, // IPv6 localhost
  /^fc00:/, // IPv6 unique local
  /^fe80:/, // IPv6 link-local
];

// Input validation helpers
export const validators = {
  /**
   * Validate URL is safe and well-formed
   * Blocks: javascript:, data:, private IPs, localhost
   */
  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }

      // Block javascript: and data: (redundant but explicit)
      if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
        return false;
      }

      // Block localhost variations
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return false;
      }

      // Block private IP ranges (SSRF prevention)
      for (const pattern of PRIVATE_IP_RANGES) {
        if (pattern.test(hostname)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Basic URL format check (less strict, for display purposes)
   * Use isValidUrl for security-critical validation
   */
  isValidUrlFormat(url: string): boolean {
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
      'whatsapp', 'facebook', 'instagram', 'linkedin', 'x', 'tiktok', 'snapchat', 'threads', 'youtube', 'pinterest', 'spotify', 'reddit', 'twitch', 'discord', 'apps',
      // Reviews & Feedback
      'google-review',
      'feedback',
      // Events
      'event',
      // Location
      'geo',
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
        if (!content.email || typeof content.email !== 'string') {
          return { valid: false, error: 'content.email is required for email type' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email)) {
          return { valid: false, error: 'Invalid email address format' };
        }
        break;

      case 'phone':
        if (!content.phone || typeof content.phone !== 'string') {
          return { valid: false, error: 'content.phone is required for phone type' };
        }
        break;

      case 'sms':
        if (!content.phone || typeof content.phone !== 'string') {
          return { valid: false, error: 'content.phone is required for SMS type' };
        }
        break;

      case 'whatsapp':
        if (!content.phone || typeof content.phone !== 'string') {
          return { valid: false, error: 'content.phone is required for WhatsApp type' };
        }
        break;

      case 'facebook':
        if (!content.profileUrl || typeof content.profileUrl !== 'string') {
          return { valid: false, error: 'content.profileUrl is required for Facebook type' };
        }
        if (!validators.isValidUrl(content.profileUrl)) {
          return { valid: false, error: 'Invalid Facebook profile URL' };
        }
        break;

      case 'instagram':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for Instagram type' };
        }
        break;

      case 'linkedin':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for LinkedIn type' };
        }
        break;

      case 'x':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for X type' };
        }
        break;

      case 'tiktok':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for TikTok type' };
        }
        break;

      case 'snapchat':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for Snapchat type' };
        }
        break;

      case 'threads':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for Threads type' };
        }
        break;

      case 'youtube':
        if (!content.videoId || typeof content.videoId !== 'string') {
          return { valid: false, error: 'content.videoId is required for YouTube type' };
        }
        if (content.videoId.length !== 11) {
          return { valid: false, error: 'YouTube video ID must be 11 characters' };
        }
        break;

      case 'pinterest':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for Pinterest type' };
        }
        break;

      case 'spotify':
        if (!content.spotifyId || typeof content.spotifyId !== 'string') {
          return { valid: false, error: 'content.spotifyId is required for Spotify type' };
        }
        if (!content.contentType || !['track', 'album', 'playlist', 'artist', 'show', 'episode'].includes(content.contentType as string)) {
          return { valid: false, error: 'content.contentType must be track, album, playlist, artist, show, or episode' };
        }
        break;

      case 'reddit':
        if (!content.contentType || !['user', 'subreddit'].includes(content.contentType as string)) {
          return { valid: false, error: 'content.contentType must be user or subreddit' };
        }
        if (content.contentType === 'user' && (!content.username || typeof content.username !== 'string')) {
          return { valid: false, error: 'content.username is required for Reddit user type' };
        }
        if (content.contentType === 'subreddit' && (!content.subreddit || typeof content.subreddit !== 'string')) {
          return { valid: false, error: 'content.subreddit is required for Reddit subreddit type' };
        }
        break;

      case 'twitch':
        if (!content.username || typeof content.username !== 'string') {
          return { valid: false, error: 'content.username is required for Twitch type' };
        }
        break;

      case 'discord':
        if (!content.inviteCode || typeof content.inviteCode !== 'string') {
          return { valid: false, error: 'content.inviteCode is required for Discord type' };
        }
        break;

      case 'apps':
        // At least one app URL is required
        if (!content.appStoreUrl && !content.playStoreUrl && !content.fallbackUrl) {
          return { valid: false, error: 'At least one of appStoreUrl, playStoreUrl, or fallbackUrl is required' };
        }
        if (content.appStoreUrl && typeof content.appStoreUrl === 'string' && !validators.isValidUrl(content.appStoreUrl)) {
          return { valid: false, error: 'Invalid App Store URL' };
        }
        if (content.playStoreUrl && typeof content.playStoreUrl === 'string' && !validators.isValidUrl(content.playStoreUrl)) {
          return { valid: false, error: 'Invalid Play Store URL' };
        }
        if (content.fallbackUrl && typeof content.fallbackUrl === 'string' && !validators.isValidUrl(content.fallbackUrl)) {
          return { valid: false, error: 'Invalid fallback URL' };
        }
        break;

      case 'google-review':
        if (!content.placeId || typeof content.placeId !== 'string') {
          return { valid: false, error: 'content.placeId is required for google-review type' };
        }
        if (content.placeId.length < 20) {
          return { valid: false, error: 'Place ID must be at least 20 characters' };
        }
        if (!content.businessName || typeof content.businessName !== 'string') {
          return { valid: false, error: 'content.businessName is required for google-review type' };
        }
        break;

      case 'feedback':
        if (!content.businessName || typeof content.businessName !== 'string') {
          return { valid: false, error: 'content.businessName is required for feedback type' };
        }
        if (content.ratingType && !['stars', 'emoji', 'numeric'].includes(content.ratingType as string)) {
          return { valid: false, error: 'content.ratingType must be stars, emoji, or numeric' };
        }
        break;

      case 'event':
        if (!content.title || typeof content.title !== 'string') {
          return { valid: false, error: 'content.title is required for event type' };
        }
        if (!content.startDate || typeof content.startDate !== 'string') {
          return { valid: false, error: 'content.startDate is required for event type' };
        }
        if (!content.endDate || typeof content.endDate !== 'string') {
          return { valid: false, error: 'content.endDate is required for event type' };
        }
        {
          const start = new Date(content.startDate as string);
          const end = new Date(content.endDate as string);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { valid: false, error: 'Invalid date format for startDate or endDate' };
          }
          if (end <= start) {
            return { valid: false, error: 'endDate must be after startDate' };
          }
        }
        break;

      case 'geo':
        if (content.latitude === undefined || content.latitude === null || typeof content.latitude !== 'number') {
          return { valid: false, error: 'content.latitude is required for geo type and must be a number' };
        }
        if (content.longitude === undefined || content.longitude === null || typeof content.longitude !== 'number') {
          return { valid: false, error: 'content.longitude is required for geo type and must be a number' };
        }
        if (content.latitude < -90 || content.latitude > 90) {
          return { valid: false, error: 'content.latitude must be between -90 and 90' };
        }
        if (content.longitude < -180 || content.longitude > 180) {
          return { valid: false, error: 'content.longitude must be between -180 and 180' };
        }
        break;

      // File upload types
      case 'pdf':
        if (!content.fileUrl && !content.fileName) {
          return { valid: false, error: 'content.fileUrl or content.fileName is required for PDF type' };
        }
        break;

      case 'images':
        if (!content.images || !Array.isArray(content.images) || content.images.length === 0) {
          return { valid: false, error: 'content.images array with at least one image is required' };
        }
        break;

      case 'video':
        if (!content.videoUrl && !content.embedUrl) {
          return { valid: false, error: 'content.videoUrl or content.embedUrl is required for video type' };
        }
        break;

      case 'mp3':
        if (!content.audioUrl && !content.embedUrl) {
          return { valid: false, error: 'content.audioUrl or content.embedUrl is required for MP3 type' };
        }
        break;

      // Landing page types
      case 'menu':
        if (!content.restaurantName || typeof content.restaurantName !== 'string') {
          return { valid: false, error: 'content.restaurantName is required for menu type' };
        }
        break;

      case 'business':
        if (!content.name || typeof content.name !== 'string') {
          return { valid: false, error: 'content.name is required for business type' };
        }
        break;

      case 'links':
        if (!content.title || typeof content.title !== 'string') {
          return { valid: false, error: 'content.title is required for links type' };
        }
        break;

      case 'coupon':
        if (!content.businessName || typeof content.businessName !== 'string') {
          return { valid: false, error: 'content.businessName is required for coupon type' };
        }
        if (!content.headline || typeof content.headline !== 'string') {
          return { valid: false, error: 'content.headline is required for coupon type' };
        }
        break;

      case 'social':
        if (!content.name || typeof content.name !== 'string') {
          return { valid: false, error: 'content.name is required for social type' };
        }
        break;

      default:
        return { valid: false, error: `Unknown content type: ${contentType}` };
    }

    return { valid: true };
  },
};
