import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deliverWebhook } from '@/lib/webhooks/deliver';

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

const MAX_BATCH_SIZE = 50;

/**
 * GET /api/cron/webhook-retries
 * Process failed webhook deliveries that are due for retry.
 * Schedule: Every 1 minute
 */
export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch failed deliveries due for retry
    const { data: deliveries, error } = await supabaseAdmin
      .from('webhook_deliveries')
      .select('id')
      .eq('status', 'failed')
      .lte('next_retry_at', new Date().toISOString())
      .order('next_retry_at', { ascending: true })
      .limit(MAX_BATCH_SIZE);

    if (error) {
      console.error('[Webhook Retries] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
    }

    if (!deliveries || deliveries.length === 0) {
      return NextResponse.json({ processed: 0, succeeded: 0, failed: 0 });
    }

    let succeeded = 0;
    let failed = 0;

    // Process each delivery with a small delay between them
    for (const delivery of deliveries) {
      try {
        const success = await deliverWebhook(delivery.id);
        if (success) {
          succeeded++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error('[Webhook Retries] Delivery error:', delivery.id, err);
        failed++;
      }

      // 100ms delay between deliveries to avoid overwhelming targets
      if (deliveries.indexOf(delivery) < deliveries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[Webhook Retries] Processed ${deliveries.length}: ${succeeded} succeeded, ${failed} failed`);

    return NextResponse.json({
      processed: deliveries.length,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error('[Webhook Retries] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
