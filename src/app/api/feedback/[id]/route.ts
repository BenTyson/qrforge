import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/admin/auth';
import { checkRateLimit } from '@/lib/redis/rate-limiter';
import { getFeedbackResponseLimit } from '@/lib/stripe/plans';
import type { SubscriptionTier } from '@/lib/stripe/plans';

// UUID v4 format check
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Basic email format check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Validate UUID format
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  // 2. Rate limit: 10 submissions / 15 min / IP
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

  const rateKey = `feedback:${ipHash}`;
  const rateResult = await checkRateLimit(rateKey);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // 3. Parse body
  let body: {
    rating?: number;
    comment?: string;
    email?: string;
    honeypot?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  // Validate rating
  const rating = body.rating;
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'invalid_rating' }, { status: 400 });
  }

  // Validate comment (optional, max 1000 chars)
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 1000) : null;

  // Validate email (optional, basic format)
  const email = typeof body.email === 'string' && body.email.trim() && EMAIL_REGEX.test(body.email.trim())
    ? body.email.trim()
    : null;

  // Honeypot check: if filled, silently succeed but don't store
  if (body.honeypot) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const adminClient = createAdminClient();

  // 4. Fetch QR code - verify exists and is feedback type
  const { data: qrCode, error: qrError } = await adminClient
    .from('qr_codes')
    .select('id, user_id, content_type')
    .eq('id', id)
    .single();

  if (qrError || !qrCode) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (qrCode.content_type !== 'feedback') {
    return NextResponse.json({ error: 'not_feedback' }, { status: 400 });
  }

  // 5. Fetch owner's tier
  const { data: profile } = await adminClient
    .from('profiles')
    .select('subscription_tier')
    .eq('id', qrCode.user_id)
    .single();

  const tier = (profile?.subscription_tier || 'free') as SubscriptionTier;

  // 6. Count monthly responses across ALL their feedback QR codes
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Get all feedback QR code IDs for this user
  const { data: feedbackQRs } = await adminClient
    .from('qr_codes')
    .select('id')
    .eq('user_id', qrCode.user_id)
    .eq('content_type', 'feedback');

  const feedbackQRIds = feedbackQRs?.map(q => q.id) || [];

  let monthlyCount = 0;
  if (feedbackQRIds.length > 0) {
    const { count } = await adminClient
      .from('feedback_responses')
      .select('id', { count: 'exact', head: true })
      .in('qr_code_id', feedbackQRIds)
      .gte('created_at', monthStart.toISOString());

    monthlyCount = count || 0;
  }

  // Check limit
  const limit = getFeedbackResponseLimit(tier);
  if (limit !== -1 && monthlyCount >= limit) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 403 });
  }

  // 7. Determine device type from user agent
  const userAgent = headersList.get('user-agent') || '';
  let deviceType = 'desktop';
  if (/mobile/i.test(userAgent)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

  // 8. Insert feedback response
  const { error: insertError } = await adminClient
    .from('feedback_responses')
    .insert({
      qr_code_id: id,
      rating,
      comment: comment || null,
      email: email || null,
      ip_hash: ipHash,
      device_type: deviceType,
    });

  if (insertError) {
    console.error('[Feedback API] Insert error:', insertError);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
