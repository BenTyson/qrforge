import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { SCAN_LIMITS } from '@/lib/stripe/config';
import { sendScanLimitReachedEmail } from '@/lib/email';
import { selectVariant } from '@/lib/ab-testing/variant-selector';
import type { ABVariant, ABAssignment } from '@/lib/ab-testing/types';

// Get the base URL for redirects (supports ngrok/proxy scenarios)
function getBaseUrl(request: Request): string {
  // Check for forwarded host (ngrok, proxies)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Fall back to APP_URL or request URL
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

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
        email,
        full_name,
        subscription_tier,
        monthly_scan_count,
        scan_count_reset_at,
        scan_limit_notified_at
      )
    `)
    .eq('short_code', code)
    .single();

  const baseUrl = getBaseUrl(request);

  if (error || !qrCode) {
    // Redirect to home page if QR code not found
    console.error('[QR Route] QR code not found:', { code, error: error?.message });
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  // Check if QR code has expired
  if (qrCode.expires_at) {
    const expiresAt = new Date(qrCode.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/expired', baseUrl));
    }
  }

  // Check scheduled activation (Pro+ feature)
  const now = new Date();
  if (qrCode.active_from) {
    const activeFrom = new Date(qrCode.active_from);
    if (now < activeFrom) {
      // QR code is not yet active
      return NextResponse.redirect(new URL('/not-active?reason=early', baseUrl));
    }
  }
  if (qrCode.active_until) {
    const activeUntil = new Date(qrCode.active_until);
    if (now > activeUntil) {
      // QR code is no longer active
      return NextResponse.redirect(new URL('/not-active?reason=ended', baseUrl));
    }
  }

  // Check if QR code is password protected
  if (qrCode.password_hash) {
    return NextResponse.redirect(new URL(`/r/${code}/unlock`, baseUrl));
  }

  // Check if QR code has a landing page enabled (custom landing page)
  console.log('[QR Route] show_landing_page:', qrCode.show_landing_page, 'for code:', code);
  if (qrCode.show_landing_page) {
    return NextResponse.redirect(new URL(`/r/${code}/landing`, baseUrl));
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
    wifi: 'wifi',
    text: 'text',
    vcard: 'vcard',
    'google-review': 'review',
    feedback: 'feedback',
    youtube: 'youtube',
    spotify: 'spotify',
    event: 'event',
    geo: 'location',
  };

  const contentType = qrCode.content_type as string;
  if (LANDING_PAGE_ROUTES[contentType]) {
    // Record the scan before redirecting to landing page
    recordScan(qrCode.id, request);
    return NextResponse.redirect(new URL(`/r/${code}/${LANDING_PAGE_ROUTES[contentType]}`, baseUrl));
  }

  // Check scan limits
  const profile = qrCode.profiles as {
    id: string;
    email: string | null;
    full_name: string | null;
    subscription_tier: 'free' | 'pro' | 'business';
    monthly_scan_count: number | null;
    scan_count_reset_at: string | null;
    scan_limit_notified_at: string | null;
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
      // Check if we need to send notification email (only once per month)
      const notifiedAt = profile.scan_limit_notified_at ? new Date(profile.scan_limit_notified_at) : null;
      const shouldNotify = !notifiedAt || notifiedAt < monthStart;

      if (shouldNotify && profile.email && (tier === 'free' || tier === 'pro')) {
        // Send email notification (async, don't block redirect)
        sendScanLimitReachedEmail(
          profile.email,
          profile.full_name || undefined,
          tier,
          limit
        ).catch(err => console.error('[Scan] Failed to send limit email:', err));

        // Update notification timestamp (async, don't block redirect)
        supabase
          .from('profiles')
          .update({ scan_limit_notified_at: new Date().toISOString() })
          .eq('id', profile.id)
          .then(({ error }) => {
            if (error) console.error('[Scan] Failed to update notification timestamp:', error);
          });
      }

      return NextResponse.redirect(new URL('/limit-reached', baseUrl));
    }
  }

  // Check for active A/B test and select variant
  const adminClient = createAdminClient();
  let abVariantUrl: string | null = null;

  try {
    const { data: test } = await adminClient
      .from('ab_tests')
      .select(`
        id,
        ab_variants (
          id,
          test_id,
          name,
          slug,
          destination_url,
          weight,
          scan_count,
          created_at
        )
      `)
      .eq('qr_code_id', qrCode.id)
      .eq('status', 'running')
      .single();

    if (test?.ab_variants && Array.isArray(test.ab_variants) && test.ab_variants.length >= 2) {
      const variants = test.ab_variants as ABVariant[];

      // Get visitor's IP hash for deterministic assignment
      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
                 headersList.get('x-real-ip') ||
                 'unknown';
      const visitorIpHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

      // Check for existing assignment
      const { data: existingAssignment } = await adminClient
        .from('ab_assignments')
        .select('id, test_id, ip_hash, variant_id, assigned_at')
        .eq('test_id', test.id)
        .eq('ip_hash', visitorIpHash)
        .single();

      // Select variant (deterministic based on hash)
      const selectedVariantResult = selectVariant(
        test.id,
        visitorIpHash,
        variants,
        existingAssignment as ABAssignment | null
      );

      // Create assignment if new visitor (async, non-blocking)
      if (!existingAssignment) {
        adminClient
          .from('ab_assignments')
          .insert({
            test_id: test.id,
            ip_hash: visitorIpHash,
            variant_id: selectedVariantResult.id,
          })
          .then(({ error }) => {
            if (error) {
              console.error('[A/B Test] Failed to create assignment:', error);
            }
          });
      }

      // Use variant's destination URL
      abVariantUrl = selectedVariantResult.destination_url;
      console.log('[A/B Test] Routing to variant:', selectedVariantResult.slug, selectedVariantResult.name);
    }
  } catch (err) {
    // A/B test lookup failed, continue with normal routing
    console.error('[A/B Test] Error checking for test:', err);
  }

  // Get destination URL (A/B variant URL takes priority if set)
  let destinationUrl = abVariantUrl || qrCode.destination_url;

  // If no destination URL, construct from content based on type
  if (!destinationUrl && qrCode.content) {
    const content = qrCode.content as Record<string, unknown>;
    const contentType = content.type as string;

    switch (contentType) {
      case 'url':
        destinationUrl = content.url as string;
        break;
      case 'whatsapp':
        // Construct WhatsApp URL: https://wa.me/{phone}?text={message}
        if (content.phone) {
          const phone = String(content.phone).replace(/\D/g, '');
          destinationUrl = `https://wa.me/${phone}`;
          if (content.message) {
            destinationUrl += `?text=${encodeURIComponent(String(content.message))}`;
          }
        }
        break;
      case 'facebook':
        destinationUrl = content.profileUrl as string;
        break;
      case 'instagram':
        if (content.username) {
          const username = String(content.username).replace('@', '');
          destinationUrl = `https://instagram.com/${username}`;
        }
        break;
      case 'linkedin':
        if (content.username) {
          const linkedinUsername = String(content.username).replace('@', '');
          destinationUrl = `https://linkedin.com/in/${linkedinUsername}`;
        }
        break;
      case 'x':
        if (content.username) {
          const xUsername = String(content.username).replace('@', '');
          destinationUrl = `https://x.com/${xUsername}`;
        }
        break;
      case 'tiktok':
        if (content.username) {
          const tiktokUsername = String(content.username).replace('@', '');
          destinationUrl = `https://tiktok.com/@${tiktokUsername}`;
        }
        break;
      case 'snapchat':
        if (content.username) {
          destinationUrl = `https://snapchat.com/add/${content.username}`;
        }
        break;
      case 'threads':
        if (content.username) {
          const threadsUsername = String(content.username).replace('@', '');
          destinationUrl = `https://threads.net/@${threadsUsername}`;
        }
        break;
      case 'pinterest':
        if (content.username) {
          const pinterestUsername = String(content.username).replace('@', '');
          destinationUrl = `https://pinterest.com/${pinterestUsername}`;
        }
        break;
      case 'reddit':
        if (content.contentType === 'subreddit' && content.subreddit) {
          destinationUrl = `https://reddit.com/r/${content.subreddit}`;
        } else if (content.username) {
          destinationUrl = `https://reddit.com/u/${content.username}`;
        }
        break;
      case 'twitch':
        if (content.username) {
          destinationUrl = `https://twitch.tv/${content.username}`;
        }
        break;
      case 'discord':
        if (content.inviteCode) {
          destinationUrl = `https://discord.gg/${content.inviteCode}`;
        }
        break;
      case 'apps':
        // Use fallbackUrl, or platform-specific URL
        destinationUrl = (content.fallbackUrl || content.appStoreUrl || content.playStoreUrl) as string;
        break;
      case 'email':
        // mailto: URL scheme
        if (content.email) {
          destinationUrl = `mailto:${content.email}`;
          const params: string[] = [];
          if (content.subject) params.push(`subject=${encodeURIComponent(String(content.subject))}`);
          if (content.body) params.push(`body=${encodeURIComponent(String(content.body))}`);
          if (params.length > 0) destinationUrl += `?${params.join('&')}`;
        }
        break;
      case 'phone':
        if (content.phone) {
          destinationUrl = `tel:${content.phone}`;
        }
        break;
      case 'sms':
        if (content.phone) {
          destinationUrl = `sms:${content.phone}`;
          if (content.message) {
            destinationUrl += `?body=${encodeURIComponent(String(content.message))}`;
          }
        }
        break;
      // text, wifi, vcard don't have redirect URLs - they're meant to be scanned directly
      // If we get here with these types, fall through to error handling
    }
  }

  if (!destinationUrl) {
    console.error('[QR Route] No destination URL:', {
      code,
      qrCodeId: qrCode.id,
      destinationUrl: qrCode.destination_url,
      content: qrCode.content,
      contentType: qrCode.content_type
    });
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  // CRITICAL: Normalize the destination URL to ensure it has a protocol
  // Without this, URLs like "example.com" would be treated as relative paths
  // and redirect to "/r/example.com" instead of "https://example.com"
  let normalizedUrl = destinationUrl.trim();
  if (normalizedUrl && !normalizedUrl.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/)) {
    // No protocol found - add https://
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Record the scan (async, don't wait)
  recordScan(qrCode.id, request);

  // Redirect to destination
  return NextResponse.redirect(normalizedUrl);
}

async function recordScan(
  qrCodeId: string,
  _request: Request
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

    // Use admin client (service role) to bypass RLS for scan recording
    // This is a system operation, not a user operation
    const adminClient = createAdminClient();

    // Insert scan record and CHECK the result
    const { error } = await adminClient.from('scans').insert({
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

    if (error) {
      console.error('[Scan] CRITICAL: Failed to insert scan record:', {
        qrCodeId,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    } else {
      console.log('[Scan] Successfully recorded scan for QR:', qrCodeId);
    }
  } catch (error) {
    console.error('[Scan] CRITICAL: Exception recording scan:', error);
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
