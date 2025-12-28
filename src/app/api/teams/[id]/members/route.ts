import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/teams/:id/members
 * List team members
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: teamId } = await params;
  const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

  // Check if user is member of this team
  const { data: membership } = await serviceClient
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch team members
  const { data: membersData, error: membersError } = await serviceClient
    .from('team_members')
    .select('id, user_id, role, created_at')
    .eq('team_id', teamId)
    .order('role', { ascending: true });

  if (membersError) {
    console.error('Fetch members error:', membersError);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }

  // Fetch profiles for each member
  const userIds = membersData?.map(m => m.user_id) || [];
  const { data: profiles } = await serviceClient
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds);

  // Combine data
  const members = membersData?.map(member => ({
    id: member.id,
    role: member.role,
    created_at: member.created_at,
    user: profiles?.find(p => p.id === member.user_id) || { id: member.user_id, email: '', full_name: null },
  })) || [];

  return NextResponse.json({ members });
}

/**
 * DELETE /api/teams/:id/members?userId=xxx
 * Remove a team member
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: teamId } = await params;
  const url = new URL(request.url);
  const userIdToRemove = url.searchParams.get('userId');

  if (!userIdToRemove) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

  // Check if user is admin/owner of this team
  const { data: membership } = await serviceClient
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get the member being removed
  const { data: targetMember } = await serviceClient
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userIdToRemove)
    .single();

  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  // Can't remove owner
  if (targetMember.role === 'owner') {
    return NextResponse.json({ error: "Cannot remove the team owner" }, { status: 400 });
  }

  // Admins can only remove members, not other admins
  if (membership.role === 'admin' && targetMember.role === 'admin') {
    return NextResponse.json({ error: 'Admins cannot remove other admins' }, { status: 403 });
  }

  const { error } = await serviceClient
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userIdToRemove);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
