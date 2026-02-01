import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

const RETENTION_DAYS = 30;

/**
 * GET /api/cron/webhook-cleanup
 * Delete webhook deliveries older than 30 days.
 * Schedule: Daily
 */
export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    const { error, count } = await supabaseAdmin
      .from('webhook_deliveries')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('[Webhook Cleanup] Delete error:', error);
      return NextResponse.json({ error: 'Failed to clean up deliveries' }, { status: 500 });
    }

    console.log(`[Webhook Cleanup] Deleted ${count || 0} deliveries older than ${RETENTION_DAYS} days`);

    return NextResponse.json({
      deleted: count || 0,
      cutoff_date: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error('[Webhook Cleanup] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
