import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMilestoneEmail, sendUsageLimitWarningEmail } from '@/lib/email';
import { SCAN_LIMITS } from '@/lib/stripe/config';

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
    scans_50: { sent: 0, errors: 0 },
    qr_codes_5: { sent: 0, errors: 0 },
    usage_80: { sent: 0, errors: 0 },
  };

  try {
    // Process 50 scans milestone
    await process50ScansMilestone(results.scans_50);

    // Process 5 QR codes milestone
    await process5QRCodesMilestone(results.qr_codes_5);

    // Process 80% usage warning
    await process80PercentWarning(results.usage_80);

    console.log('Milestone email cron completed:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Milestone email cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}

async function process50ScansMilestone(tracker: { sent: number; errors: number }) {
  // Find users who have crossed 50 total scans
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, email, full_name,
      qr_codes(scan_count)
    `)
    .eq('marketing_unsubscribed', false);

  if (error || !users) {
    console.error('Error querying users for 50 scans:', error);
    return;
  }

  // Calculate total scans per user and filter those >= 50
  const eligibleUsers = users
    .map(user => ({
      ...user,
      totalScans: (user.qr_codes as { scan_count: number }[] || [])
        .reduce((sum, qr) => sum + (qr.scan_count || 0), 0),
    }))
    .filter(user => user.totalScans >= 50 && user.totalScans < 100); // Only first-time milestones

  // Check who already received this email
  const { data: alreadySent } = await supabaseAdmin
    .from('onboarding_emails')
    .select('user_id')
    .eq('email_type', 'scans_50')
    .in('user_id', eligibleUsers.map(u => u.id));

  const sentUserIds = new Set((alreadySent || []).map(r => r.user_id));
  const usersToEmail = eligibleUsers.filter(u => !sentUserIds.has(u.id));

  for (const user of usersToEmail) {
    if (!user.email) continue;

    const result = await sendMilestoneEmail(
      user.email,
      user.full_name,
      'scans_50',
      user.totalScans
    );

    if (result.success) {
      await supabaseAdmin.from('onboarding_emails').insert({
        user_id: user.id,
        email_type: 'scans_50',
      });
      tracker.sent++;
    } else {
      tracker.errors++;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function process5QRCodesMilestone(tracker: { sent: number; errors: number }) {
  // Find users who have created at least 5 QR codes
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, email, full_name,
      qr_codes(id)
    `)
    .eq('marketing_unsubscribed', false);

  if (error || !users) {
    console.error('Error querying users for 5 QR codes:', error);
    return;
  }

  // Filter users with >= 5 QR codes
  const eligibleUsers = users
    .map(user => ({
      ...user,
      qrCount: (user.qr_codes as { id: string }[] || []).length,
    }))
    .filter(user => user.qrCount >= 5 && user.qrCount < 10);

  // Check who already received this email
  const { data: alreadySent } = await supabaseAdmin
    .from('onboarding_emails')
    .select('user_id')
    .eq('email_type', 'qr_codes_5')
    .in('user_id', eligibleUsers.map(u => u.id));

  const sentUserIds = new Set((alreadySent || []).map(r => r.user_id));
  const usersToEmail = eligibleUsers.filter(u => !sentUserIds.has(u.id));

  for (const user of usersToEmail) {
    if (!user.email) continue;

    const result = await sendMilestoneEmail(
      user.email,
      user.full_name,
      'qr_codes_5',
      user.qrCount
    );

    if (result.success) {
      await supabaseAdmin.from('onboarding_emails').insert({
        user_id: user.id,
        email_type: 'qr_codes_5',
      });
      tracker.sent++;
    } else {
      tracker.errors++;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function process80PercentWarning(tracker: { sent: number; errors: number }) {
  // Find FREE users approaching their scan limit (80%+)
  // Pro users are excluded - we don't want usage warnings to make them question their subscription value
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, subscription_tier, monthly_scan_count')
    .eq('marketing_unsubscribed', false)
    .eq('subscription_tier', 'free'); // Only free users - nudge to upgrade

  if (error || !users) {
    console.error('Error querying users for 80% warning:', error);
    return;
  }

  // Filter users at 80%+ usage
  const eligibleUsers = users.filter(user => {
    const tier = (user.subscription_tier || 'free') as keyof typeof SCAN_LIMITS;
    const limit = SCAN_LIMITS[tier];
    if (limit === -1) return false; // Unlimited

    const usage = user.monthly_scan_count || 0;
    const percent = (usage / limit) * 100;
    return percent >= 80 && percent < 100; // 80-99%
  });

  // Check who already received this email this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: alreadySent } = await supabaseAdmin
    .from('onboarding_emails')
    .select('user_id')
    .eq('email_type', 'usage_80')
    .gte('sent_at', startOfMonth.toISOString())
    .in('user_id', eligibleUsers.map(u => u.id));

  const sentUserIds = new Set((alreadySent || []).map(r => r.user_id));
  const usersToEmail = eligibleUsers.filter(u => !sentUserIds.has(u.id));

  for (const user of usersToEmail) {
    if (!user.email) continue;

    const tier = (user.subscription_tier || 'free') as keyof typeof SCAN_LIMITS;
    const limit = SCAN_LIMITS[tier];
    const usage = user.monthly_scan_count || 0;

    const result = await sendUsageLimitWarningEmail(
      user.email,
      user.full_name,
      usage,
      limit,
      tier as 'free' | 'pro'
    );

    if (result.success) {
      await supabaseAdmin.from('onboarding_emails').insert({
        user_id: user.id,
        email_type: 'usage_80',
      });
      tracker.sent++;
    } else {
      tracker.errors++;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Also support POST for flexibility with different cron providers
export async function POST(request: Request) {
  return GET(request);
}
