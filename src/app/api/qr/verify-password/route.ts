import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { checkRateLimit, resetRateLimit, getClientIP } from '@/lib/rate-limit';

// Rate limit configuration
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Types that have dedicated landing pages (must match route.ts)
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
  youtube: 'youtube',
  spotify: 'spotify',
  event: 'event',
  geo: 'location',
};

export async function POST(request: Request) {
  try {
    // Check rate limit first
    const clientIP = getClientIP(request);
    const rateLimitKey = `password:${clientIP}`;
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT_ATTEMPTS, RATE_LIMIT_WINDOW_MS);

    if (!rateLimit.success) {
      console.warn(`[Security] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many attempts. Please try again later.',
          retryAfter: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.reset - Math.floor(Date.now() / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT_ATTEMPTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.reset),
          },
        }
      );
    }

    const { code, password } = await request.json();

    if (!code || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing code or password' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('password_hash, destination_url, content, content_type, show_landing_page')
      .eq('short_code', code)
      .single();

    if (error || !qrCode) {
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }

    if (!qrCode.password_hash) {
      return NextResponse.json(
        { success: false, error: 'This QR code is not password protected' },
        { status: 400 }
      );
    }

    // Use bcrypt.compare which is timing-safe
    const isValid = await bcrypt.compare(password, qrCode.password_hash);

    if (!isValid) {
      console.warn(`[Security] Failed password attempt for QR code: ${code} from IP: ${clientIP}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid password',
          attemptsRemaining: rateLimit.remaining,
        },
        {
          status: 401,
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.reset),
          },
        }
      );
    }

    // Reset rate limit on successful verification
    await resetRateLimit(rateLimitKey);

    // If custom landing page is enabled, redirect there
    if (qrCode.show_landing_page) {
      return NextResponse.json({
        success: true,
        redirectUrl: `/r/${code}/landing`,
        hasLandingPage: true,
      });
    }

    // Check if content type has a dedicated landing page
    const contentType = qrCode.content_type as string;
    if (LANDING_PAGE_ROUTES[contentType]) {
      return NextResponse.json({
        success: true,
        redirectUrl: `/r/${code}/${LANDING_PAGE_ROUTES[contentType]}`,
        hasLandingPage: true,
      });
    }

    // Get destination URL for redirect types
    let destinationUrl = qrCode.destination_url;

    if (!destinationUrl && qrCode.content) {
      const content = qrCode.content as Record<string, string>;
      if (content.type === 'url' && content.url) {
        destinationUrl = content.url;
      }
    }

    if (!destinationUrl) {
      return NextResponse.json(
        { success: false, error: 'No destination URL found' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      destinationUrl,
      hasLandingPage: false,
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
