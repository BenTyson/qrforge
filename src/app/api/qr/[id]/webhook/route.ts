import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';
import { generateWebhookSecret, isValidWebhookUrl } from '@/lib/webhooks/deliver';

/**
 * GET /api/qr/:id/webhook
 * Get webhook configuration for a QR code
 */
export async function GET(
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

    // Fetch webhook config
    const { data: config } = await supabase
      .from('webhook_configs')
      .select('id, qr_code_id, url, is_active, events, created_at, updated_at')
      .eq('qr_code_id', id)
      .single();

    return NextResponse.json({ webhook: config || null });
  } catch (error) {
    console.error('[Webhook API] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/qr/:id/webhook
 * Create or update webhook configuration (upsert)
 */
export async function POST(
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

    const body = await request.json();
    const { url, is_active, events } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const urlValidation = isValidWebhookUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    // Check if config already exists
    const adminClient = createAdminClient();
    const { data: existing } = await adminClient
      .from('webhook_configs')
      .select('id, secret')
      .eq('qr_code_id', id)
      .single();

    if (existing) {
      // Update existing config
      const { data: updated, error: updateError } = await adminClient
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
        console.error('[Webhook API] Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
      }

      return NextResponse.json({ webhook: updated });
    }

    // Create new config with generated secret
    const secret = generateWebhookSecret();

    const { data: created, error: createError } = await adminClient
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
      console.error('[Webhook API] Create error:', createError);
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
    }

    // Return secret only on creation
    return NextResponse.json({
      webhook: created,
      secret,
    }, { status: 201 });
  } catch (error) {
    console.error('[Webhook API] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/qr/:id/webhook
 * Remove webhook configuration
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Delete config (cascades to deliveries)
    const { error: deleteError } = await supabase
      .from('webhook_configs')
      .delete()
      .eq('qr_code_id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[Webhook API] Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook API] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
