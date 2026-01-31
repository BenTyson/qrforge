import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/redis/rate-limiter';
import { sendContactFormEmail } from '@/lib/email';

// Basic email format check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_SUBJECTS = ['general', 'support', 'billing', 'feature', 'partnership', 'other'] as const;

export async function POST(request: Request) {
  // 1. Rate limit by IP
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);

  const rateKey = `contact:${ipHash}`;
  const rateResult = await checkRateLimit(rateKey);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // 2. Parse body
  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    honeypot?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  // 3. Validate fields
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 100) {
    return NextResponse.json({ error: 'invalid_name' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !EMAIL_REGEX.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  if (!subject || !VALID_SUBJECTS.includes(subject as typeof VALID_SUBJECTS[number])) {
    return NextResponse.json({ error: 'invalid_subject' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length < 10 || message.length > 5000) {
    return NextResponse.json({ error: 'invalid_message' }, { status: 400 });
  }

  // 4. Honeypot check: if filled, silently succeed but don't send
  if (body.honeypot) {
    return NextResponse.json({ success: true });
  }

  // 5. Send email
  try {
    const result = await sendContactFormEmail(name, email, subject, message);

    if (!result.success) {
      console.error('[Contact API] Email send failed:', result.error);
      return NextResponse.json({ error: 'send_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Contact API] Unexpected error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
