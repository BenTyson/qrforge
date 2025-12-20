import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createClient();

  // Find the QR code by short_code
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('short_code', code)
    .single();

  if (error || !qrCode) {
    // Redirect to home page if QR code not found
    return NextResponse.redirect(new URL('/', request.url));
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
