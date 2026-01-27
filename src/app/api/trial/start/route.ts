import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TRIAL_DURATION_DAYS = 7;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user already used trial or is on paid plan
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('subscription_tier, trial_used, trial_ends_at')
    .eq('id', user.id)
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Can't start trial if already on paid plan
  if (profile.subscription_tier !== 'free') {
    return NextResponse.json(
      { error: 'Trial not available for paid subscribers' },
      { status: 400 }
    );
  }

  // Can't start trial if already used
  if (profile.trial_used) {
    return NextResponse.json(
      { error: 'Trial already used' },
      { status: 400 }
    );
  }

  // Can't start trial if one is currently active
  if (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date()) {
    return NextResponse.json(
      { error: 'Trial already active' },
      { status: 400 }
    );
  }

  // Calculate trial end date
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

  // Start the trial
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      trial_ends_at: trialEndsAt.toISOString(),
      trial_used: true,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to start trial:', updateError);
    return NextResponse.json(
      { error: 'Failed to start trial' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    trial_ends_at: trialEndsAt.toISOString(),
    days: TRIAL_DURATION_DAYS,
  });
}
