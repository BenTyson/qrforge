import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { SCAN_LIMITS } from '@/lib/stripe/config';

// In-memory cache for geolocation (reduces API calls)
// Cache entries expire after 1 hour
const geoCache = new Map<string, { data: GeoData | null; timestamp: number }>();
const GEO_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Common bot user agent patterns
const BOT_PATTERNS = [
  /bot/i, /spider/i, /crawl/i, /slurp/i,
  /mediapartners/i, /adsbot/i, /bingpreview/i,
  /facebookexternalhit/i, /linkedinbot/i, /twitterbot/i,
  /whatsapp/i, /telegrambot/i, /discordbot/i,
  /googlebot/i, /baiduspider/i, /yandex/i,
  /duckduckbot/i, /sogou/i, /exabot/i,
  /facebot/i, /ia_archiver/i, /mj12bot/i,
  /semrushbot/i, /ahrefsbot/i, /dotbot/i,
  /petalbot/i, /applebot/i, /seznambot/i,
  /curl/i, /wget/i, /python-requests/i,
  /go-http-client/i, /java\//i, /okhttp/i,
  /headlesschrome/i, /phantomjs/i, /puppeteer/i,
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createClient();

  // Find the QR code by short_code with owner profile
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select(`
      *,
      profiles:user_id (
        id,
        subscription_tier,
        monthly_scan_count,
        scan_count_reset_at
      )
    `)
    .eq('short_code', code)
    .single();

  if (error || !qrCode) {
    // Redirect to home page if QR code not found
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if QR code has expired
  if (qrCode.expires_at) {
    const expiresAt = new Date(qrCode.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/expired', request.url));
    }
  }

  // Check scheduled activation (Pro+ feature)
  const now = new Date();
  if (qrCode.active_from) {
    const activeFrom = new Date(qrCode.active_from);
    if (now < activeFrom) {
      // QR code is not yet active
      return NextResponse.redirect(new URL('/not-active?reason=early', request.url));
    }
  }
  if (qrCode.active_until) {
    const activeUntil = new Date(qrCode.active_until);
    if (now > activeUntil) {
      // QR code is no longer active
      return NextResponse.redirect(new URL('/not-active?reason=ended', request.url));
    }
  }

  // Check if QR code is password protected
  if (qrCode.password_hash) {
    return NextResponse.redirect(new URL(`/r/${code}/unlock`, request.url));
  }

  // Check if QR code has a landing page enabled (custom landing page)
  console.log('[QR Route] show_landing_page:', qrCode.show_landing_page, 'for code:', code);
  if (qrCode.show_landing_page) {
    return NextResponse.redirect(new URL(`/r/${code}/landing`, request.url));
  }

  // Route landing page types to their specific pages
  const LANDING_PAGE_ROUTES: Record<string, string> = {
    pdf: 'pdf',
    images: 'gallery',
    video: 'video',
    mp3: 'audio',
    menu: 'menu',
    business: 'business',
    links: 'links',
    coupon: 'coupon',
    social: 'social',
  };

  const contentType = qrCode.content_type as string;
  if (LANDING_PAGE_ROUTES[contentType]) {
    // Record the scan before redirecting to landing page
    recordScan(supabase, qrCode.id, request);
    return NextResponse.redirect(new URL(`/r/${code}/${LANDING_PAGE_ROUTES[contentType]}`, request.url));
  }

  // Check scan limits
  const profile = qrCode.profiles as {
    id: string;
    subscription_tier: 'free' | 'pro' | 'business';
    monthly_scan_count: number | null;
    scan_count_reset_at: string | null;
  } | null;

  if (profile) {
    const tier = profile.subscription_tier || 'free';
    const limit = SCAN_LIMITS[tier];
    const currentCount = profile.monthly_scan_count || 0;

    // Check if we need to reset (new month) - handled in DB trigger, but double-check
    const resetAt = profile.scan_count_reset_at ? new Date(profile.scan_count_reset_at) : new Date(0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const effectiveCount = resetAt < monthStart ? 0 : currentCount;

    // If limit is not unlimited (-1) and exceeded, redirect to limit page
    if (limit !== -1 && effectiveCount >= limit) {
      return NextResponse.redirect(new URL('/limit-reached', request.url));
    }
  }

  // Get destination URL
  let destinationUrl = qrCode.destination_url;

  // If no destination URL, construct from content
  if (!destinationUrl && qrCode.content) {
    const content = qrCode.content as Record<string, any>;
    if (content.type === 'url' && content.url) {
      destinationUrl = content.url;
    }
  }

  if (!destinationUrl) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Record the scan (async, don't wait)
  recordScan(supabase, qrCode.id, request);

  // Redirect to destination
  return NextResponse.redirect(destinationUrl);
}

async function recordScan(
  supabase: any,
  qrCodeId: string,
  request: Request
) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               'unknown';
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';

    // Skip bot traffic - don't record scans from crawlers
    if (isBot(userAgent)) {
      console.log('[Scan] Skipping bot:', userAgent.slice(0, 100));
      return;
    }

    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

    // Parse user agent (basic)
    const deviceType = getDeviceType(userAgent);
    const os = getOS(userAgent);
    const browser = getBrowser(userAgent);

    // Get geolocation data (with caching)
    const geoData = await getGeolocationCached(ip);

    // Insert scan record
    await supabase.from('scans').insert({
      qr_code_id: qrCodeId,
      ip_hash: ipHash,
      device_type: deviceType,
      os: os,
      browser: browser,
      referrer: referrer,
      country: geoData?.country || null,
      city: geoData?.city || null,
      region: geoData?.region || null,
    });
  } catch (error) {
    console.error('Failed to record scan:', error);
  }
}

/**
 * Check if user agent appears to be a bot/crawler
 */
function isBot(userAgent: string): boolean {
  if (!userAgent) return true; // Empty UA is suspicious
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

interface GeoData {
  country: string;
  city: string;
  region: string;
}

/**
 * Get geolocation with caching to reduce API calls
 */
async function getGeolocationCached(ip: string): Promise<GeoData | null> {
  // Skip for local/private IPs
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') ||
      ip.startsWith('10.') || ip === '::1' || ip.startsWith('172.')) {
    return null;
  }

  // Check cache first
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.data;
  }

  // Clean up old cache entries periodically (every 100 requests)
  if (geoCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of geoCache.entries()) {
      if (now - value.timestamp > GEO_CACHE_TTL) {
        geoCache.delete(key);
      }
    }
  }

  try {
    // Using IP-API (free tier: 45 requests/minute, no API key required)
    // For production with higher limits, consider MaxMind or paid IP-API
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) {
      geoCache.set(ip, { data: null, timestamp: Date.now() });
      return null;
    }

    const data = await response.json();

    if (data.status !== 'success') {
      geoCache.set(ip, { data: null, timestamp: Date.now() });
      return null;
    }

    const geoData: GeoData = {
      country: data.country || '',
      city: data.city || '',
      region: data.regionName || '',
    };

    // Cache the result
    geoCache.set(ip, { data: geoData, timestamp: Date.now() });

    return geoData;
  } catch (error) {
    // Cache the failure to avoid repeated requests
    geoCache.set(ip, { data: null, timestamp: Date.now() });
    console.error('Geolocation lookup failed:', error);
    return null;
  }
}

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh|mac os/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

function getBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/edge|edg/i.test(userAgent)) return 'Edge';
  return 'Unknown';
}
