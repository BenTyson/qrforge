import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, apiSuccess } from '@/lib/api/auth';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/v1/qr-codes
 * List all QR codes for the authenticated user
 */
export async function GET(request: Request) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  const user = await validateApiKey(authHeader);
  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const type = url.searchParams.get('type'); // 'static' or 'dynamic'

  let query = supabase
    .from('qr_codes')
    .select('id, name, type, content_type, content, short_code, destination_url, scan_count, created_at, expires_at, active_from, active_until', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type === 'static' || type === 'dynamic') {
    query = query.eq('type', type);
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError('Failed to fetch QR codes', 500);
  }

  // Add image URLs to each QR code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
  const qrCodesWithUrls = data?.map(qr => ({
    ...qr,
    redirect_url: qr.short_code ? `${baseUrl}/r/${qr.short_code}` : null,
    image_url: `${baseUrl}/api/v1/qr-codes/${qr.id}/image`,
    image_url_svg: `${baseUrl}/api/v1/qr-codes/${qr.id}/image?format=svg`,
  })) || [];

  return apiSuccess({
    qr_codes: qrCodesWithUrls,
    total: count,
    limit,
    offset,
  });
}

/**
 * POST /api/v1/qr-codes
 * Create a new QR code
 *
 * Body:
 * - name: string (required)
 * - type: 'static' | 'dynamic' (default: 'dynamic')
 * - content_type: string (default: 'url')
 * - content: object (required)
 * - style: object (optional) - { foregroundColor, backgroundColor, errorCorrectionLevel, margin }
 * - expires_at: ISO date string (optional)
 * - active_from: ISO date string (optional)
 * - active_until: ISO date string (optional)
 */
export async function POST(request: Request) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  const user = await validateApiKey(authHeader);
  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const { name, type = 'dynamic', content_type = 'url', content, style, expires_at, active_from, active_until } = body;

  if (!name || typeof name !== 'string') {
    return apiError('name is required', 400);
  }

  if (!content || typeof content !== 'object') {
    return apiError('content is required', 400);
  }

  // Validate content based on type
  if (content_type === 'url' && !content.url) {
    return apiError('content.url is required for URL type', 400);
  }

  // Build style object with defaults
  const defaultStyle = {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M' as const,
    margin: 2,
  };

  const validatedStyle = {
    foregroundColor: style?.foregroundColor || defaultStyle.foregroundColor,
    backgroundColor: style?.backgroundColor || defaultStyle.backgroundColor,
    errorCorrectionLevel: ['L', 'M', 'Q', 'H'].includes(style?.errorCorrectionLevel)
      ? style.errorCorrectionLevel
      : defaultStyle.errorCorrectionLevel,
    margin: typeof style?.margin === 'number' && style.margin >= 0 && style.margin <= 10
      ? style.margin
      : defaultStyle.margin,
  };

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Generate short code for dynamic QR codes
  let shortCode = null;
  let destinationUrl = null;

  if (type === 'dynamic') {
    shortCode = generateShortCode();
    destinationUrl = content.url || null;
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: user.id,
      name,
      type,
      content_type,
      content,
      short_code: shortCode,
      destination_url: destinationUrl,
      expires_at: expires_at || null,
      active_from: active_from || null,
      active_until: active_until || null,
      style: validatedStyle,
    })
    .select('id, name, type, content_type, content, short_code, destination_url, scan_count, created_at, style')
    .single();

  if (error) {
    console.error('API create error:', error);
    return apiError('Failed to create QR code', 500);
  }

  // Build response with image URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  const response = {
    ...data,
    redirect_url: shortCode ? `${baseUrl}/r/${shortCode}` : null,
    image_url: `${apiBaseUrl}/api/v1/qr-codes/${data.id}/image`,
    image_url_svg: `${apiBaseUrl}/api/v1/qr-codes/${data.id}/image?format=svg`,
  };

  return apiSuccess(response, 201);
}

function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
