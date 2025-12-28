import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, apiSuccess } from '@/lib/api/auth';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/v1/qr-codes/:id
 * Get a specific QR code
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  const user = await validateApiKey(authHeader);
  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('qr_codes')
    .select('id, name, type, content_type, content, short_code, destination_url, scan_count, created_at, expires_at, active_from, active_until, style')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    return apiError('QR code not found', 404);
  }

  // Add the redirect URL and image URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
  const response = {
    ...data,
    redirect_url: data.short_code ? `${baseUrl}/r/${data.short_code}` : null,
    image_url: `${baseUrl}/api/v1/qr-codes/${data.id}/image`,
    image_url_svg: `${baseUrl}/api/v1/qr-codes/${data.id}/image?format=svg`,
  };

  return apiSuccess(response);
}

/**
 * PATCH /api/v1/qr-codes/:id
 * Update a QR code
 *
 * Body (all optional):
 * - name: string
 * - content: object
 * - destination_url: string
 * - style: object - { foregroundColor, backgroundColor, errorCorrectionLevel, margin }
 * - expires_at: ISO date string
 * - active_from: ISO date string
 * - active_until: ISO date string
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  const user = await validateApiKey(authHeader);
  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // First check the QR code exists and belongs to user
  const { data: existing, error: fetchError } = await supabase
    .from('qr_codes')
    .select('id, type, style')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existing) {
    return apiError('QR code not found', 404);
  }

  // Only allow certain fields to be updated
  const allowedFields = ['name', 'content', 'destination_url', 'expires_at', 'active_from', 'active_until'];
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  // Handle style updates - merge with existing style
  if (body.style && typeof body.style === 'object') {
    const existingStyle = (existing.style as Record<string, unknown>) || {};
    const newStyle = body.style;

    updates.style = {
      foregroundColor: newStyle.foregroundColor || existingStyle.foregroundColor || '#000000',
      backgroundColor: newStyle.backgroundColor || existingStyle.backgroundColor || '#ffffff',
      errorCorrectionLevel: ['L', 'M', 'Q', 'H'].includes(newStyle.errorCorrectionLevel)
        ? newStyle.errorCorrectionLevel
        : existingStyle.errorCorrectionLevel || 'M',
      margin: typeof newStyle.margin === 'number' && newStyle.margin >= 0 && newStyle.margin <= 10
        ? newStyle.margin
        : existingStyle.margin ?? 2,
    };
  }

  if (Object.keys(updates).length === 0) {
    return apiError('No valid fields to update', 400);
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .update(updates)
    .eq('id', id)
    .select('id, name, type, content_type, content, short_code, destination_url, scan_count, created_at, expires_at, active_from, active_until, style')
    .single();

  if (error) {
    console.error('API update error:', error);
    return apiError('Failed to update QR code', 500);
  }

  // Add the redirect URL and image URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
  const response = {
    ...data,
    redirect_url: data.short_code ? `${baseUrl}/r/${data.short_code}` : null,
    image_url: `${baseUrl}/api/v1/qr-codes/${data.id}/image`,
    image_url_svg: `${baseUrl}/api/v1/qr-codes/${data.id}/image?format=svg`,
  };

  return apiSuccess(response);
}

/**
 * DELETE /api/v1/qr-codes/:id
 * Delete a QR code
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  const user = await validateApiKey(authHeader);
  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check ownership first
  const { data: existing, error: fetchError } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existing) {
    return apiError('QR code not found', 404);
  }

  const { error } = await supabase
    .from('qr_codes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('API delete error:', error);
    return apiError('Failed to delete QR code', 500);
  }

  return new Response(null, { status: 204 });
}
