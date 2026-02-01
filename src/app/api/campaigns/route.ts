import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TIER_LIMITS } from '@/lib/supabase/types';

// GET /api/campaigns - List user's campaigns
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error in GET /api/campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'business';

    // Check if user can use campaigns
    const campaignLimit = TIER_LIMITS[tier].campaigns;
    if (campaignLimit === 0) {
      return NextResponse.json(
        { error: 'Campaigns require a Pro or Business subscription' },
        { status: 403 }
      );
    }

    // Check campaign count limit
    const { count } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (typeof campaignLimit === 'number' && (count || 0) >= campaignLimit) {
      return NextResponse.json(
        { error: `You've reached your campaign limit (${campaignLimit}). Upgrade to Business for unlimited campaigns.` },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, color, start_date, end_date } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json({ error: 'Campaign name cannot be empty' }, { status: 400 });
    }

    if (trimmedName.length > 100) {
      return NextResponse.json({ error: 'Campaign name must be 100 characters or less' }, { status: 400 });
    }

    // Validate description
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string') {
        return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
      }
      if (description.length > 500) {
        return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 });
      }
    }

    // Create the campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name: trimmedName,
        description: description || null,
        color: color || '#6366f1',
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
