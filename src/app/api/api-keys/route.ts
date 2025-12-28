import { createClient } from '@/lib/supabase/server';
import { generateApiKey } from '@/lib/api/auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/api-keys
 * List all API keys for the current user
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is Business tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_tier !== 'business') {
    return NextResponse.json({ error: 'API keys require Business subscription' }, { status: 403 });
  }

  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, environment, request_count, monthly_request_count, last_used_at, created_at, revoked_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }

  return NextResponse.json({ keys });
}

/**
 * POST /api/api-keys
 * Create a new API key
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is Business tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_tier !== 'business') {
    return NextResponse.json({ error: 'API keys require Business subscription' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, environment = 'production' } = body;
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  // Validate environment
  const validEnvironments = ['production', 'development', 'testing'];
  if (!validEnvironments.includes(environment)) {
    return NextResponse.json({ error: 'Invalid environment' }, { status: 400 });
  }

  // Check key limit (max 5 active keys)
  const { count } = await supabase
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('revoked_at', null);

  if ((count || 0) >= 5) {
    return NextResponse.json({ error: 'Maximum 5 active API keys allowed' }, { status: 400 });
  }

  // Generate the key
  const { key, keyHash, keyPrefix } = generateApiKey();

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      environment,
    })
    .select('id, name, key_prefix, environment, created_at')
    .single();

  if (error) {
    console.error('Create API key error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }

  // Return the full key - this is the only time it will be shown
  return NextResponse.json({
    ...data,
    key, // Full key - show once!
  }, { status: 201 });
}
