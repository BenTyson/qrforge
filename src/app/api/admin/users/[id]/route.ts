import { createClient } from '@/lib/supabase/server';
import { createAdminClient, isAdmin } from '@/lib/admin/auth';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET user details (for admin)
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

  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user: profile });
}

// PATCH user (admin actions)
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
        target_type: 'user',
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
      const { error } = await adminClient
        .from('profiles')
        .update({ monthly_scan_count: 0, scan_count_reset_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to reset scan count' }, { status: 500 });
      }

      await logAdminAction('reset_scan_count', { previous_count: data?.previous_count });
      return NextResponse.json({ success: true, message: 'Scan count reset' });
    }

    case 'update_tier': {
      const { tier } = data;
      if (!['free', 'pro', 'business'].includes(tier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }

      const { error } = await adminClient
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
      }

      await logAdminAction('update_tier', { new_tier: tier, previous_tier: data?.previous_tier });
      return NextResponse.json({ success: true, message: `Tier updated to ${tier}` });
    }

    case 'update_status': {
      const { status } = data;
      if (!['active', 'past_due', 'canceled', 'disabled'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const { error } = await adminClient
        .from('profiles')
        .update({ subscription_status: status })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
      }

      await logAdminAction('update_status', { new_status: status, previous_status: data?.previous_status });
      return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
