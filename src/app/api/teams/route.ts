import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/teams
 * List teams the user is a member of
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service client to bypass RLS
  const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

  // Check if user is Business tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_tier !== 'business') {
    return NextResponse.json({ error: 'Teams require Business subscription' }, { status: 403 });
  }

  // Get teams where user is a member
  const { data: memberships, error } = await serviceClient
    .from('team_members')
    .select(`
      role,
      team:teams (
        id,
        name,
        owner_id,
        created_at
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Fetch teams error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }

  const teams = memberships?.map(m => ({
    ...m.team,
    role: m.role,
  })) || [];

  return NextResponse.json({ teams });
}

/**
 * POST /api/teams
 * Create a new team
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service client to bypass RLS
  const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);

  // Check if user is Business tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_tier !== 'business') {
    return NextResponse.json({ error: 'Teams require Business subscription' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name } = body;
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  // Check team limit (max 3 teams per user)
  const { count } = await serviceClient
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  if ((count || 0) >= 3) {
    return NextResponse.json({ error: 'Maximum 3 teams allowed' }, { status: 400 });
  }

  // Create team
  const { data: team, error: teamError } = await serviceClient
    .from('teams')
    .insert({
      name,
      owner_id: user.id,
    })
    .select()
    .single();

  if (teamError) {
    console.error('Create team error:', teamError);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }

  // Add owner as team member
  const { error: memberError } = await serviceClient
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    console.error('Add owner as member error:', memberError);
    // Cleanup team if member creation fails
    await serviceClient.from('teams').delete().eq('id', team.id);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }

  return NextResponse.json({ team }, { status: 201 });
}
