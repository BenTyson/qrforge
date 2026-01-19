import { createClient } from '@/lib/supabase/server';
import { createAdminClient, isAdmin } from '@/lib/admin/auth';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET QR code details (for admin)
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  // Verify admin access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const { data: qrCode, error } = await adminClient
    .from('qr_codes')
    .select(`
      *,
      profiles!inner(id, email, full_name, subscription_tier)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
  }

  return NextResponse.json({ qrCode });
}

// PATCH QR code (admin actions)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  // Verify admin access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, data } = body;

  const adminClient = createAdminClient();

  // Log the admin action
  const logAdminAction = async (actionType: string, details: Record<string, unknown>) => {
    try {
      await adminClient.from('admin_audit_log').insert({
        admin_id: user.id,
        admin_email: user.email,
        action_type: actionType,
        target_type: 'qr_code',
        target_id: id,
        details,
      });
    } catch {
      // Audit log table may not exist yet, continue anyway
      console.warn('Failed to log admin action (audit table may not exist)');
    }
  };

  switch (action) {
    case 'reset_scan_count': {
      // Get current QR code
      const { data: qrCode } = await adminClient
        .from('qr_codes')
        .select('scan_count')
        .eq('id', id)
        .single();

      const { error } = await adminClient
        .from('qr_codes')
        .update({ scan_count: 0 })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to reset scan count' }, { status: 500 });
      }

      await logAdminAction('reset_qr_scan_count', { previous_count: qrCode?.scan_count });
      return NextResponse.json({ success: true, message: 'Scan count reset' });
    }

    case 'disable': {
      // Set expiration to now to effectively disable
      const { error } = await adminClient
        .from('qr_codes')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to disable QR code' }, { status: 500 });
      }

      await logAdminAction('disable_qr_code', {});
      return NextResponse.json({ success: true, message: 'QR code disabled' });
    }

    case 'enable': {
      // Remove expiration to enable
      const { error } = await adminClient
        .from('qr_codes')
        .update({ expires_at: null })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to enable QR code' }, { status: 500 });
      }

      await logAdminAction('enable_qr_code', {});
      return NextResponse.json({ success: true, message: 'QR code enabled' });
    }

    case 'transfer_ownership': {
      const { new_user_id } = data;
      if (!new_user_id) {
        return NextResponse.json({ error: 'New user ID required' }, { status: 400 });
      }

      // Verify new user exists
      const { data: newUser, error: userError } = await adminClient
        .from('profiles')
        .select('id, email')
        .eq('id', new_user_id)
        .single();

      if (userError || !newUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }

      // Get current owner
      const { data: qrCode } = await adminClient
        .from('qr_codes')
        .select('user_id')
        .eq('id', id)
        .single();

      const { error } = await adminClient
        .from('qr_codes')
        .update({ user_id: new_user_id })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to transfer ownership' }, { status: 500 });
      }

      await logAdminAction('transfer_qr_ownership', {
        previous_user_id: qrCode?.user_id,
        new_user_id,
        new_user_email: newUser.email,
      });
      return NextResponse.json({ success: true, message: 'Ownership transferred' });
    }

    case 'update_destination': {
      const { destination_url } = data;
      if (!destination_url) {
        return NextResponse.json({ error: 'Destination URL required' }, { status: 400 });
      }

      const { error } = await adminClient
        .from('qr_codes')
        .update({ destination_url })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to update destination' }, { status: 500 });
      }

      await logAdminAction('update_qr_destination', { new_destination: destination_url });
      return NextResponse.json({ success: true, message: 'Destination URL updated' });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

// DELETE QR code (admin action)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  // Verify admin access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Get QR code info before deletion for audit log
  const { data: qrCode } = await adminClient
    .from('qr_codes')
    .select('name, user_id, type, content_type')
    .eq('id', id)
    .single();

  const { error } = await adminClient
    .from('qr_codes')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 });
  }

  // Log the admin action
  try {
    await adminClient.from('admin_audit_log').insert({
      admin_id: user.id,
      admin_email: user.email,
      action_type: 'delete_qr_code',
      target_type: 'qr_code',
      target_id: id,
      details: {
        name: qrCode?.name,
        user_id: qrCode?.user_id,
        type: qrCode?.type,
        content_type: qrCode?.content_type,
      },
    });
  } catch {
    console.warn('Failed to log admin action (audit table may not exist)');
  }

  return NextResponse.json({ success: true, message: 'QR code deleted' });
}
