import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendOnboardingDay1Email,
  sendOnboardingDay3Email,
  sendOnboardingDay7Email,
} from '@/lib/email';

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
    day1: { sent: 0, errors: 0 },
    day3: { sent: 0, errors: 0 },
    day7: { sent: 0, errors: 0 },
  };

  try {
    const now = new Date();

    // Calculate date ranges for each email
    // Day 1: users who signed up 1 day ago (between 24-48 hours)
    const day1Start = new Date(now);
    day1Start.setHours(day1Start.getHours() - 48);
    const day1End = new Date(now);
    day1End.setHours(day1End.getHours() - 24);

    // Day 3: users who signed up 3 days ago (between 72-96 hours)
    const day3Start = new Date(now);
    day3Start.setHours(day3Start.getHours() - 96);
    const day3End = new Date(now);
    day3End.setHours(day3End.getHours() - 72);

    // Day 7: users who signed up 7 days ago (between 168-192 hours)
    const day7Start = new Date(now);
    day7Start.setHours(day7Start.getHours() - 192);
    const day7End = new Date(now);
    day7End.setHours(day7End.getHours() - 168);

    // Process Day 1 emails
    await processOnboardingEmails(
      'day1',
      day1Start,
      day1End,
      sendOnboardingDay1Email,
      results.day1
    );

    // Process Day 3 emails
    await processOnboardingEmails(
      'day3',
      day3Start,
      day3End,
      sendOnboardingDay3Email,
      results.day3
    );

    // Process Day 7 emails
    await processOnboardingEmails(
      'day7',
      day7Start,
      day7End,
      sendOnboardingDay7Email,
      results.day7
    );

    console.log('Onboarding email cron completed:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Onboarding email cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}

async function processOnboardingEmails(
  emailType: 'day1' | 'day3' | 'day7',
  startDate: Date,
  endDate: Date,
  sendFunction: (to: string, userName?: string) => Promise<{ success: boolean; error?: string }>,
  resultTracker: { sent: number; errors: number }
) {
  // Find users who:
  // 1. Signed up in the date range
  // 2. Haven't received this email yet
  // 3. Haven't unsubscribed from marketing
  // 4. Are still on free tier (no need to upsell paid users)
  const { data: eligibleUsers, error: queryError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name')
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString())
    .eq('marketing_unsubscribed', false)
    .eq('subscription_tier', 'free');

  if (queryError) {
    console.error(`Error querying users for ${emailType}:`, queryError);
    return;
  }

  if (!eligibleUsers || eligibleUsers.length === 0) {
    return;
  }

  // Filter out users who already received this email
  const { data: alreadySent } = await supabaseAdmin
    .from('onboarding_emails')
    .select('user_id')
    .eq('email_type', emailType)
    .in('user_id', eligibleUsers.map(u => u.id));

  const sentUserIds = new Set((alreadySent || []).map(r => r.user_id));
  const usersToEmail = eligibleUsers.filter(u => !sentUserIds.has(u.id));

  // Send emails
  for (const user of usersToEmail) {
    if (!user.email) continue;

    const result = await sendFunction(user.email, user.full_name);

    if (result.success) {
      // Record that we sent this email
      await supabaseAdmin.from('onboarding_emails').insert({
        user_id: user.id,
        email_type: emailType,
      });
      resultTracker.sent++;
    } else {
      console.error(`Failed to send ${emailType} to ${user.email}:`, result.error);
      resultTracker.errors++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Also support POST for flexibility with different cron providers
export async function POST(request: Request) {
  return GET(request);
}
