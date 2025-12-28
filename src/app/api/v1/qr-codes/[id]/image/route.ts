import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, rateLimitError, validators } from '@/lib/api/auth';
import { generateQRPNG, generateQRSVGServer } from '@/lib/qr/server-generator';
import { headers } from 'next/headers';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/v1/qr-codes/:id/image
 * Generate and return the actual QR code image
 *
 * Query Parameters:
 * - format: 'png' | 'svg' (default: 'png')
 * - size: 128-2048 (default: 512)
 * - download: 'true' to add Content-Disposition header
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo } = await validateApiKey(authHeader, clientIp);

  // Check rate limit
  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;
  const url = new URL(request.url);

  // Parse query parameters
  const format = url.searchParams.get('format') || 'png';
  const sizeParam = url.searchParams.get('size');
  const download = url.searchParams.get('download') === 'true';

  // Validate format
  if (!['png', 'svg'].includes(format)) {
    return apiError('Invalid format. Use "png" or "svg"', 400);
  }

  // Validate and clamp size
  let size = 512;
  if (sizeParam) {
    size = parseInt(sizeParam, 10);
    if (isNaN(size) || size < 128 || size > 2048) {
      return apiError('Size must be between 128 and 2048', 400);
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch the QR code
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .select('id, name, type, content_type, content, short_code, destination_url, style')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !qrCode) {
    return apiError('QR code not found', 404);
  }

  // Build the content object
  let content: QRContent;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  if (qrCode.type === 'dynamic' && qrCode.short_code) {
    // Dynamic QR codes always point to the redirect URL
    content = {
      type: 'url',
      url: `${baseUrl}/r/${qrCode.short_code}`,
    };
  } else {
    // Static QR codes use the stored content
    content = qrCode.content as QRContent;
  }

  // Build style from stored settings
  const storedStyle = qrCode.style as Partial<QRStyleOptions> || {};
  const style: Partial<QRStyleOptions> = {
    foregroundColor: storedStyle.foregroundColor || '#000000',
    backgroundColor: storedStyle.backgroundColor || '#ffffff',
    errorCorrectionLevel: storedStyle.errorCorrectionLevel || 'M',
    margin: storedStyle.margin ?? 2,
    width: size,
  };

  try {
    // Sanitize filename for Content-Disposition header
    const safeFilename = validators.sanitizeFilename(qrCode.name || 'qrcode');

    if (format === 'svg') {
      const svg = await generateQRSVGServer(content, style);

      const responseHeaders: HeadersInit = {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      };

      if (download) {
        // Use RFC 5987 encoding for filename to handle special characters safely
        responseHeaders['Content-Disposition'] = `attachment; filename="${safeFilename}.svg"; filename*=UTF-8''${encodeURIComponent(safeFilename)}.svg`;
      }

      return new Response(svg, { headers: responseHeaders });
    } else {
      const pngBuffer = await generateQRPNG(content, style);

      const responseHeaders: HeadersInit = {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      };

      if (download) {
        // Use RFC 5987 encoding for filename to handle special characters safely
        responseHeaders['Content-Disposition'] = `attachment; filename="${safeFilename}.png"; filename*=UTF-8''${encodeURIComponent(safeFilename)}.png`;
      }

      // Convert Buffer to Uint8Array for Response body
      return new Response(new Uint8Array(pngBuffer), { headers: responseHeaders });
    }
  } catch (err) {
    console.error('QR generation error:', err);
    return apiError('Failed to generate QR code image', 500);
  }
}
