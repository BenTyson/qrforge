import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/teams/:id/invites
 * List pending invites for a team
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

  const { data: invites, error } = await serviceClient
    .from('team_invites')
    .select('id, email, role, created_at, expires_at')
    .eq('team_id', teamId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  }

  return NextResponse.json({ invites });
}

/**
 * POST /api/teams/:id/invites
 * Create a new invite
 */
export async function POST(
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, role = 'member' } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  if (!['admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Check if email is already a member
  const { data: existingUser } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    const { data: existingMember } = await serviceClient
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', existingUser.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
    }
  }

  // Check for existing pending invite
  const { data: existingInvite } = await serviceClient
    .from('team_invites')
    .select('id')
    .eq('team_id', teamId)
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existingInvite) {
    return NextResponse.json({ error: 'Invite already pending for this email' }, { status: 400 });
  }

  // Generate invite token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

  const { data: invite, error } = await serviceClient
    .from('team_invites')
    .insert({
      team_id: teamId,
      email,
      role,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select('id, email, role, created_at, expires_at')
    .single();

  if (error) {
    console.error('Create invite error:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }

  // Generate invite link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
  const inviteLink = `${baseUrl}/invite/${token}`;

  return NextResponse.json({
    invite,
    invite_link: inviteLink,
  }, { status: 201 });
}
