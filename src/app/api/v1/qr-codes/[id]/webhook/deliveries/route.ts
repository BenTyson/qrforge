import { createClient } from '@supabase/supabase-js';
import { validateApiKey, apiError, apiSuccess, rateLimitError, monthlyLimitError, incrementRequestCount } from '@/lib/api/auth';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/v1/qr-codes/:id/webhook/deliveries
 * List webhook delivery logs (paginated)
 * Query params: ?page=1&limit=20&status=success|failed|exhausted
 */
export async function GET(
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

  // Get webhook config
  const { data: config } = await supabase
    .from('webhook_configs')
    .select('id')
    .eq('qr_code_id', id)
    .single();

  if (!config) {
    await incrementRequestCount(user.keyHash);
    return apiSuccess({ deliveries: [], total: 0, page: 1, limit: 20 });
  }

  // Parse query params
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  const statusFilter = url.searchParams.get('status');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('webhook_deliveries')
    .select('id, event_type, payload, status, http_status, response_body, error_message, attempt_number, max_attempts, next_retry_at, created_at, delivered_at', { count: 'exact' })
    .eq('webhook_config_id', config.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (statusFilter && ['pending', 'success', 'failed', 'exhausted'].includes(statusFilter)) {
    query = query.eq('status', statusFilter);
  }

  const { data: deliveries, error: queryError, count } = await query;

  if (queryError) {
    return apiError('Failed to fetch deliveries', 500);
  }

  await incrementRequestCount(user.keyHash);

  return apiSuccess({
    deliveries: deliveries || [],
    total: count || 0,
    page,
    limit,
  });
}
