import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/invites/:token/accept
 * Accept a team invitation
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await params;
  const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

  // Fetch invite
  const { data: invite, error: fetchError } = await serviceClient
    .from('team_invites')
    .select('id, team_id, email, role, expires_at, accepted_at')
    .eq('token', token)
    .single();

  if (fetchError || !invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  // Check if already accepted
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Invite already accepted' }, { status: 400 });
  }

  // Check if expired
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
  }

  // Check email matches (case-insensitive)
  if (user.email?.toLowerCase() !== invite.email?.toLowerCase()) {
    return NextResponse.json({
      error: 'This invite was sent to a different email address',
    }, { status: 403 });
  }

  // Check if already a member
  const { data: existingMember } = await serviceClient
    .from('team_members')
    .select('id')
    .eq('team_id', invite.team_id)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    // Mark invite as accepted anyway
    await serviceClient
      .from('team_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    return NextResponse.json({ error: 'Already a team member' }, { status: 400 });
  }

  // Add user as team member
  const { error: memberError } = await serviceClient
    .from('team_members')
    .insert({
      team_id: invite.team_id,
      user_id: user.id,
      role: invite.role,
    });

  if (memberError) {
    console.error('Add member error:', memberError);
    return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
  }

  // Mark invite as accepted
  await serviceClient
    .from('team_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return NextResponse.json({ success: true });
}
