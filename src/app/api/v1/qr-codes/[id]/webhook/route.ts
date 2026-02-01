import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, apiSuccess, rateLimitError, monthlyLimitError, incrementRequestCount } from '@/lib/api/auth';
import { headers } from 'next/headers';
import { generateWebhookSecret, isValidWebhookUrl } from '@/lib/webhooks/deliver';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/v1/qr-codes/:id/webhook
 * Get webhook configuration for a QR code
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo, monthlyLimitExceeded } = await validateApiKey(authHeader, clientIp);

  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

  if (monthlyLimitExceeded) {
    return monthlyLimitError();
  }

  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify QR code ownership
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!qrCode) {
    return apiError('QR code not found', 404);
  }

  // Fetch webhook config
  const { data: config } = await supabase
    .from('webhook_configs')
    .select('id, qr_code_id, url, is_active, events, created_at, updated_at')
    .eq('qr_code_id', id)
    .single();

  await incrementRequestCount(user.keyHash);

  return apiSuccess({ webhook: config || null });
}

/**
 * PUT /api/v1/qr-codes/:id/webhook
 * Create or update webhook configuration (upsert)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo, monthlyLimitExceeded } = await validateApiKey(authHeader, clientIp);

  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

  if (monthlyLimitExceeded) {
    return monthlyLimitError();
  }

  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify QR code ownership
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!qrCode) {
    return apiError('QR code not found', 404);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const { url, is_active, events } = body;

  if (!url || typeof url !== 'string') {
    return apiError('url is required', 400);
  }

  const urlValidation = isValidWebhookUrl(url);
  if (!urlValidation.valid) {
    return apiError(urlValidation.error || 'Invalid URL', 400);
  }

  // Check if config already exists
  const { data: existing } = await supabase
    .from('webhook_configs')
    .select('id, secret')
    .eq('qr_code_id', id)
    .single();

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from('webhook_configs')
      .update({
        url,
        is_active: is_active !== undefined ? is_active : true,
        events: events || ['scan'],
      })
      .eq('id', existing.id)
      .select('id, qr_code_id, url, is_active, events, created_at, updated_at')
      .single();

    if (updateError) {
      return apiError('Failed to update webhook', 500);
    }

    await incrementRequestCount(user.keyHash);
    return apiSuccess({ webhook: updated });
  }

  // Create new
  const secret = generateWebhookSecret();

  const { data: created, error: createError } = await supabase
    .from('webhook_configs')
    .insert({
      qr_code_id: id,
      user_id: user.id,
      url,
      secret,
      is_active: is_active !== undefined ? is_active : true,
      events: events || ['scan'],
    })
    .select('id, qr_code_id, url, is_active, events, created_at, updated_at')
    .single();

  if (createError) {
    return apiError('Failed to create webhook', 500);
  }

  await incrementRequestCount(user.keyHash);
  return apiSuccess({ webhook: created, secret }, 201);
}

/**
 * DELETE /api/v1/qr-codes/:id/webhook
 * Remove webhook configuration
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined;

  const { user, rateLimitInfo, monthlyLimitExceeded } = await validateApiKey(authHeader, clientIp);

  if (rateLimitInfo && !rateLimitInfo.allowed) {
    return rateLimitError(rateLimitInfo.resetAt);
  }

  if (monthlyLimitExceeded) {
    return monthlyLimitError();
  }

  if (!user) {
    return apiError('Invalid or missing API key', 401);
  }

  const { id } = await params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify QR code ownership
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!qrCode) {
    return apiError('QR code not found', 404);
  }

  const { error: deleteError } = await supabase
    .from('webhook_configs')
    .delete()
    .eq('qr_code_id', id);

  if (deleteError) {
    return apiError('Failed to delete webhook', 500);
  }

  await incrementRequestCount(user.keyHash);
  return apiSuccess({ deleted: true });
}
