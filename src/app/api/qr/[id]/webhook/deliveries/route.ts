import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/qr/:id/webhook/deliveries
 * List webhook delivery logs (paginated)
 * Query params: ?page=1&limit=20&status=success|failed|exhausted
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier !== 'business') {
      return NextResponse.json({ error: 'Webhook notifications require a Business plan' }, { status: 403 });
    }

    const { id } = await params;

    // Verify QR code ownership
    const { data: qrCode } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Verify webhook config exists and get its ID
    const { data: config } = await supabase
      .from('webhook_configs')
      .select('id')
      .eq('qr_code_id', id)
      .single();

    if (!config) {
      return NextResponse.json({ deliveries: [], total: 0, page: 1, limit: 20 });
    }

    // Parse query params
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const statusFilter = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    // Query deliveries via admin client (RLS blocks user access to deliveries)
    const adminClient = createAdminClient();

    let query = adminClient
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
      console.error('[Webhook Deliveries] Query error:', queryError);
      return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
    }

    return NextResponse.json({
      deliveries: deliveries || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('[Webhook Deliveries] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
