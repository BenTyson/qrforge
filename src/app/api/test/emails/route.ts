import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';

// Import all email templates
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { OnboardingDay1 } from '@/emails/OnboardingDay1';
import { OnboardingDay3 } from '@/emails/OnboardingDay3';
import { OnboardingDay7 } from '@/emails/OnboardingDay7';
import { TrialEndingSoon } from '@/emails/TrialEndingSoon';
import { MilestoneEmail } from '@/emails/MilestoneEmail';
import { UsageLimitWarning } from '@/emails/UsageLimitWarning';
import { SubscriptionConfirmEmail } from '@/emails/SubscriptionConfirmEmail';
import { PaymentFailedEmail } from '@/emails/PaymentFailedEmail';
import { ScanLimitReachedEmail } from '@/emails/ScanLimitReachedEmail';
import { TeamInviteEmail } from '@/emails/TeamInviteEmail';

// Only allow in development or with admin secret
function isAuthorized(request: NextRequest): boolean {
  // Allow in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, require admin secret
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;

  if (!adminSecret) return false;
  return authHeader === `Bearer ${adminSecret}`;
}

// Email template configurations with sample data
const EMAIL_TEMPLATES = {
  welcome: {
    name: 'Welcome Email',
    subject: 'Welcome to QRWolf!',
    component: WelcomeEmail,
    sampleProps: { userName: 'John' },
  },
  onboarding_day1: {
    name: 'Onboarding Day 1',
    subject: 'Create your first QR code in 60 seconds',
    component: OnboardingDay1,
    sampleProps: { userName: 'John' },
  },
  onboarding_day3: {
    name: 'Onboarding Day 3',
    subject: '3 powerful features you might not know about',
    component: OnboardingDay3,
    sampleProps: { userName: 'John' },
  },
  onboarding_day7: {
    name: 'Onboarding Day 7',
    subject: "You've been using QRWolf for a week - here's what's next",
    component: OnboardingDay7,
    sampleProps: { userName: 'John' },
  },
  trial_ending: {
    name: 'Trial Ending Soon',
    subject: 'Your Pro trial ends in 3 days',
    component: TrialEndingSoon,
    sampleProps: { userName: 'John', daysRemaining: 3 },
  },
  milestone_scans: {
    name: 'Milestone - 50 Scans',
    subject: 'Your QR codes hit 50 scans!',
    component: MilestoneEmail,
    sampleProps: { userName: 'John', milestoneType: 'scans_50' as const, milestoneValue: 50 },
  },
  milestone_qrcodes: {
    name: 'Milestone - 5 QR Codes',
    subject: "You've created 5 QR codes!",
    component: MilestoneEmail,
    sampleProps: { userName: 'John', milestoneType: 'qr_codes_5' as const, milestoneValue: 5 },
  },
  usage_warning: {
    name: 'Usage Limit Warning (80%)',
    subject: "You've used 80% of your monthly scans",
    component: UsageLimitWarning,
    sampleProps: { userName: 'John', currentUsage: 400, limit: 500, currentPlan: 'free' as const },
  },
  subscription_confirm: {
    name: 'Subscription Confirmation',
    subject: 'Welcome to QRWolf Pro!',
    component: SubscriptionConfirmEmail,
    sampleProps: {
      userName: 'John',
      plan: 'pro' as const,
      billingCycle: 'monthly' as const,
      amount: '$19',
      nextBillingDate: 'February 26, 2026',
    },
  },
  payment_failed: {
    name: 'Payment Failed',
    subject: 'Action required: Your QRWolf payment could not be processed',
    component: PaymentFailedEmail,
    sampleProps: { userName: 'John', plan: 'pro' as const, amount: '$19', retryDate: 'January 29, 2026' },
  },
  scan_limit_reached: {
    name: 'Scan Limit Reached',
    subject: 'Your QR codes reached 500 scans this month',
    component: ScanLimitReachedEmail,
    sampleProps: { userName: 'John', currentPlan: 'free' as const, scanLimit: 500 },
  },
  team_invite: {
    name: 'Team Invite',
    subject: 'Sarah invited you to join Acme Inc on QRWolf',
    component: TeamInviteEmail,
    sampleProps: {
      inviterName: 'Sarah',
      teamName: 'Acme Inc',
      inviteUrl: 'https://qrwolf.com/invite/abc123',
      role: 'Editor',
    },
  },
};

type TemplateKey = keyof typeof EMAIL_TEMPLATES;

/**
 * GET /api/test/emails - List all templates or preview one
 *
 * Query params:
 * - template: Template key to preview (returns HTML)
 * - format: 'html' (default) or 'text'
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const templateKey = searchParams.get('template') as TemplateKey | null;
  const format = searchParams.get('format') || 'html';

  // If no template specified, return list of templates
  if (!templateKey) {
    const templates = Object.entries(EMAIL_TEMPLATES).map(([key, config]) => ({
      key,
      name: config.name,
      subject: config.subject,
      previewUrl: `/api/test/emails?template=${key}`,
    }));

    return NextResponse.json({
      message: 'Email Test Endpoint',
      instructions: {
        preview: 'GET /api/test/emails?template=<key> - Preview email as HTML',
        send: 'POST /api/test/emails with { template, to, props? }',
      },
      templates,
    });
  }

  // Validate template key
  if (!EMAIL_TEMPLATES[templateKey]) {
    return NextResponse.json(
      { error: `Unknown template: ${templateKey}`, available: Object.keys(EMAIL_TEMPLATES) },
      { status: 400 }
    );
  }

  const template = EMAIL_TEMPLATES[templateKey];

  try {
    // Render the email
    const Component = template.component;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = Component(template.sampleProps as any);

    if (format === 'text') {
      const text = await render(element, { plainText: true });
      return new NextResponse(text, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const html = await render(element);

    // Return HTML directly for browser preview
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Failed to render email:', error);
    return NextResponse.json(
      { error: 'Failed to render email', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test/emails - Send a test email
 *
 * Body:
 * - template: Template key (required)
 * - to: Recipient email (required)
 * - props: Override sample props (optional)
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { template: templateKey, to, props } = body as {
      template: TemplateKey;
      to: string;
      props?: Record<string, unknown>;
    };

    // Validate inputs
    if (!templateKey || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: template, to' },
        { status: 400 }
      );
    }

    if (!EMAIL_TEMPLATES[templateKey]) {
      return NextResponse.json(
        { error: `Unknown template: ${templateKey}`, available: Object.keys(EMAIL_TEMPLATES) },
        { status: 400 }
      );
    }

    // Validate email format
    if (!to.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const template = EMAIL_TEMPLATES[templateKey];
    const finalProps = { ...template.sampleProps, ...props };

    // Check for Resend API key
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured - cannot send emails' },
        { status: 500 }
      );
    }

    // Render and send the email
    const Component = template.component;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = Component(finalProps as any);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'QRWolf <hello@qrwolf.com>',
      to,
      replyTo: 'hello@qrwolf.com',
      subject: `[TEST] ${template.subject}`,
      react: element,
    });

    if (error) {
      console.error('Failed to send test email:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
      emailId: data?.id,
      template: templateKey,
      subject: `[TEST] ${template.subject}`,
    });
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}
