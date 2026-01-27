import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTrialEndingSoonEmail } from '@/lib/email';

// Use service role for cron job
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    sent: 0,
    errors: 0,
  };

  try {
    const now = new Date();

    // Find users whose trial ends in 3 days (between 72-96 hours)
    // This gives them a warning before the trial ends
    const trialEndingStart = new Date(now);
    trialEndingStart.setHours(trialEndingStart.getHours() + 72);
    const trialEndingEnd = new Date(now);
    trialEndingEnd.setHours(trialEndingEnd.getHours() + 96);

    // Find eligible users
    const { data: users, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, trial_ends_at')
      .gte('trial_ends_at', trialEndingStart.toISOString())
      .lt('trial_ends_at', trialEndingEnd.toISOString())
      .eq('subscription_tier', 'free') // Still on free (hasn't upgraded)
      .eq('marketing_unsubscribed', false);

    if (queryError) {
      console.error('Error querying trial users:', queryError);
      return NextResponse.json(
        { error: 'Query failed', details: queryError.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        results,
        timestamp: now.toISOString(),
      });
    }

    // Check who already received the email (tracked in onboarding_emails with type 'trial_ending')
    const { data: alreadySent } = await supabaseAdmin
      .from('onboarding_emails')
      .select('user_id')
      .eq('email_type', 'trial_ending')
      .in('user_id', users.map(u => u.id));

    const sentUserIds = new Set((alreadySent || []).map(r => r.user_id));
    const usersToEmail = users.filter(u => !sentUserIds.has(u.id));

    // Send emails
    for (const user of usersToEmail) {
      if (!user.email || !user.trial_ends_at) continue;

      const daysRemaining = Math.ceil(
        (new Date(user.trial_ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const result = await sendTrialEndingSoonEmail(
        user.email,
        user.full_name,
        daysRemaining
      );

      if (result.success) {
        // Record that we sent this email
        await supabaseAdmin.from('onboarding_emails').insert({
          user_id: user.id,
          email_type: 'trial_ending',
        });
        results.sent++;
      } else {
        console.error(`Failed to send trial ending email to ${user.email}:`, result.error);
        results.errors++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Trial ending email cron completed:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Trial ending email cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility with different cron providers
export async function POST(request: Request) {
  return GET(request);
}
