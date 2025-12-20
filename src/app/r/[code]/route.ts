import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { SCAN_LIMITS } from '@/lib/stripe/config';

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

  // Check if QR code is password protected
  if (qrCode.password_hash) {
    return NextResponse.redirect(new URL(`/r/${code}/unlock`, request.url));
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

    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

    // Parse user agent (basic)
    const deviceType = getDeviceType(userAgent);
    const os = getOS(userAgent);
    const browser = getBrowser(userAgent);

    // Get geolocation data from IP-API (free tier: 45 requests/minute)
    const geoData = await getGeolocation(ip);

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

interface GeoData {
  country: string;
  city: string;
  region: string;
}

async function getGeolocation(ip: string): Promise<GeoData | null> {
  // Skip for local/private IPs
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') ||
      ip.startsWith('10.') || ip === '::1' || ip.startsWith('172.')) {
    return null;
  }

  try {
    // Using IP-API (free tier: 45 requests/minute, no API key required)
    // For production with higher limits, consider MaxMind or paid IP-API
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 'success') {
      return null;
    }

    return {
      country: data.country || '',
      city: data.city || '',
      region: data.regionName || '',
    };
  } catch (error) {
    // Silently fail - geolocation is nice-to-have, not critical
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
