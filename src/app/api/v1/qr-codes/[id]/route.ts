import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, apiSuccess, rateLimitError, validators } from '@/lib/api/auth';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MAX_NAME_LENGTH = 255;
const MAX_URL_LENGTH = 2048;

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
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo } = await validateApiKey(authHeader, clientIp);

  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

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
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo } = await validateApiKey(authHeader, clientIp);

  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

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

  const updates: Record<string, unknown> = {};

  // Validate and add name if provided
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !validators.validateStringLength(body.name, MAX_NAME_LENGTH)) {
      return apiError(`name must be a string of ${MAX_NAME_LENGTH} characters or less`, 400);
    }
    updates.name = body.name.trim();
  }

  // Validate and add content if provided
  if (body.content !== undefined) {
    if (typeof body.content !== 'object') {
      return apiError('content must be an object', 400);
    }
    updates.content = body.content;
  }

  // Validate and add destination_url if provided
  if (body.destination_url !== undefined) {
    if (body.destination_url !== null) {
      if (typeof body.destination_url !== 'string') {
        return apiError('destination_url must be a string or null', 400);
      }
      if (!validators.validateStringLength(body.destination_url, MAX_URL_LENGTH)) {
        return apiError(`destination_url must be ${MAX_URL_LENGTH} characters or less`, 400);
      }
      if (!validators.isValidUrl(body.destination_url)) {
        return apiError('Invalid destination_url. Must start with http:// or https://', 400);
      }
    }
    updates.destination_url = body.destination_url;
  }

  // Validate and add date fields if provided
  if (body.expires_at !== undefined) {
    if (body.expires_at !== null && !validators.isValidISODate(body.expires_at)) {
      return apiError('expires_at must be a valid ISO date string or null', 400);
    }
    updates.expires_at = body.expires_at;
  }

  if (body.active_from !== undefined) {
    if (body.active_from !== null && !validators.isValidISODate(body.active_from)) {
      return apiError('active_from must be a valid ISO date string or null', 400);
    }
    updates.active_from = body.active_from;
  }

  if (body.active_until !== undefined) {
    if (body.active_until !== null && !validators.isValidISODate(body.active_until)) {
      return apiError('active_until must be a valid ISO date string or null', 400);
    }
    updates.active_until = body.active_until;
  }

  // Handle style updates - merge with existing style and validate
  if (body.style && typeof body.style === 'object') {
    const existingStyle = (existing.style as Record<string, unknown>) || {};
    const newStyle = body.style;

    updates.style = {
      foregroundColor: newStyle.foregroundColor && validators.isValidHexColor(newStyle.foregroundColor)
        ? newStyle.foregroundColor
        : existingStyle.foregroundColor || '#000000',
      backgroundColor: newStyle.backgroundColor && validators.isValidHexColor(newStyle.backgroundColor)
        ? newStyle.backgroundColor
        : existingStyle.backgroundColor || '#ffffff',
      errorCorrectionLevel: newStyle.errorCorrectionLevel && validators.isValidErrorCorrectionLevel(newStyle.errorCorrectionLevel)
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
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo } = await validateApiKey(authHeader, clientIp);

  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

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
