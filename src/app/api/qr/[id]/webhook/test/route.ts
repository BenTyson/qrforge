import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';
import { buildWebhookPayload, deliverWebhook } from '@/lib/webhooks/deliver';

/**
 * POST /api/qr/:id/webhook/test
 * Send a test webhook with mock scan data
 */
export async function POST(
  _request: Request,
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

    // Verify QR code ownership and get details
    const { data: qrCode } = await supabase
      .from('qr_codes')
      .select('id, name, short_code, content_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Fetch webhook config
    const adminClient = createAdminClient();
    const { data: config } = await adminClient
      .from('webhook_configs')
      .select('id')
      .eq('qr_code_id', id)
      .eq('is_active', true)
      .single();

    if (!config) {
      return NextResponse.json({ error: 'No active webhook configured for this QR code' }, { status: 404 });
    }

    // Create a test delivery with mock scan data
    const mockScanData = {
      scanned_at: new Date().toISOString(),
      device_type: 'mobile',
      os: 'iOS',
      browser: 'Safari',
      country: 'United States',
      city: 'San Francisco',
      region: 'California',
    };

    // Create delivery record
    const { data: delivery, error: insertError } = await adminClient
      .from('webhook_deliveries')
      .insert({
        webhook_config_id: config.id,
        scan_id: null, // Test delivery has no real scan
        event_type: 'scan',
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !delivery) {
      console.error('[Webhook Test] Failed to create delivery:', insertError?.message);
      return NextResponse.json({ error: 'Failed to create test delivery' }, { status: 500 });
    }

    // Build and attach payload
    const payload = buildWebhookPayload(delivery.id, 'test-scan-id', mockScanData, qrCode);

    await adminClient.from('webhook_deliveries').update({
      payload,
    }).eq('id', delivery.id);

    // Deliver synchronously for test so we can return the result
    const success = await deliverWebhook(delivery.id);

    // Fetch the updated delivery for response details
    const { data: result } = await adminClient
      .from('webhook_deliveries')
      .select('status, http_status, response_body, error_message')
      .eq('id', delivery.id)
      .single();

    return NextResponse.json({
      success,
      delivery_id: delivery.id,
      status: result?.status,
      http_status: result?.http_status,
      response_body: result?.response_body,
      error_message: result?.error_message,
    });
  } catch (error) {
    console.error('[Webhook Test] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
