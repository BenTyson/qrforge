import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin/auth';
import { generateQRSVGServer } from '@/lib/qr/server-generator';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import type { QRContent } from '@/lib/qr/types';

// Rate limit: 60 requests per minute per IP
const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// UUID v4 regex for validating the id param
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Invalid QR code ID' }, { status: 400 });
    }

    // Rate limit by IP
    const clientIP = getClientIP(request);
    const rateLimitKey = `embed:${clientIP}`;
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.reset * 1000 - Date.now()) / 1000)),
          },
        }
      );
    }

    // Parse and clamp size
    const url = new URL(request.url);
    const sizeParam = url.searchParams.get('size');
    let size = 256;
    if (sizeParam) {
      const parsed = parseInt(sizeParam, 10);
      if (!isNaN(parsed)) {
        size = Math.max(64, Math.min(1024, parsed));
      }
    }

    // Fetch QR code from database (admin client bypasses RLS)
    const supabase = createAdminClient();
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('id, content, content_type, short_code, destination_url, style')
      .eq('id', id)
      .single();

    if (error || !qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Determine content to encode
    // If QR has a short_code, encode the redirect URL (enables tracking)
    // Otherwise fall back to stored content
    let qrContent: QRContent;
    if (qrCode.short_code) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
      qrContent = { type: 'url', url: `${appUrl}/r/${qrCode.short_code}` };
    } else {
      qrContent = qrCode.content as QRContent;
    }

    // Generate SVG server-side
    const svg = await generateQRSVGServer(qrContent, {
      ...(qrCode.style as Record<string, unknown>),
      width: size,
    });

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[Embed API] Error generating embed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
