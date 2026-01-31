import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { TeamInviteEmail } from '@/emails/TeamInviteEmail';
import { SubscriptionConfirmEmail } from '@/emails/SubscriptionConfirmEmail';
import { PaymentFailedEmail } from '@/emails/PaymentFailedEmail';
import { ScanLimitReachedEmail } from '@/emails/ScanLimitReachedEmail';
import { OnboardingDay1 } from '@/emails/OnboardingDay1';
import { OnboardingDay3 } from '@/emails/OnboardingDay3';
import { OnboardingDay7 } from '@/emails/OnboardingDay7';
import { TrialEndingSoon } from '@/emails/TrialEndingSoon';
import { MilestoneEmail } from '@/emails/MilestoneEmail';
import { UsageLimitWarning } from '@/emails/UsageLimitWarning';
import { ContactFormEmail } from '@/emails/ContactFormEmail';

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Email sender configuration
const FROM_EMAIL = 'QRWolf <hello@qrwolf.com>';
const REPLY_TO = 'hello@qrwolf.com';

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  to: string,
  userName?: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: 'Welcome to QRWolf!',
      react: WelcomeEmail({ userName }),
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send team invite email
 */
export async function sendTeamInviteEmail(
  to: string,
  inviterName: string,
  teamName: string,
  inviteUrl: string,
  role?: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `${inviterName} invited you to join ${teamName} on QRWolf`,
      react: TeamInviteEmail({ inviterName, teamName, inviteUrl, role }),
    });

    if (error) {
      console.error('Failed to send team invite email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending team invite email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmEmail(
  to: string,
  userName: string | undefined,
  plan: 'pro' | 'business',
  billingCycle: 'monthly' | 'yearly',
  amount: string,
  nextBillingDate: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const planName = plan === 'pro' ? 'Pro' : 'Business';

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `Welcome to QRWolf ${planName}!`,
      react: SubscriptionConfirmEmail({
        userName,
        plan,
        billingCycle,
        amount,
        nextBillingDate,
      }),
    });

    if (error) {
      console.error('Failed to send subscription email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending subscription email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  to: string,
  userName: string | undefined,
  plan: 'pro' | 'business',
  amount: string,
  retryDate?: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: 'Action required: Your QRWolf payment could not be processed',
      react: PaymentFailedEmail({ userName, plan, amount, retryDate }),
    });

    if (error) {
      console.error('Failed to send payment failed email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending payment failed email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send scan limit reached email
 */
export async function sendScanLimitReachedEmail(
  to: string,
  userName: string | undefined,
  currentPlan: 'free' | 'pro',
  scanLimit: number
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `Your QR codes reached ${scanLimit.toLocaleString()} scans this month`,
      react: ScanLimitReachedEmail({ userName, currentPlan, scanLimit }),
    });

    if (error) {
      console.error('Failed to send scan limit reached email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending scan limit reached email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send Day 1 onboarding email
 */
export async function sendOnboardingDay1Email(
  to: string,
  userName?: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: 'Create your first QR code in 60 seconds',
      react: OnboardingDay1({ userName }),
    });

    if (error) {
      console.error('Failed to send onboarding day 1 email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending onboarding day 1 email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send Day 3 onboarding email
 */
export async function sendOnboardingDay3Email(
  to: string,
  userName?: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: '3 powerful features you might not know about',
      react: OnboardingDay3({ userName }),
    });

    if (error) {
      console.error('Failed to send onboarding day 3 email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending onboarding day 3 email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send Day 7 onboarding email
 */
export async function sendOnboardingDay7Email(
  to: string,
  userName?: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: 'You\'ve been using QRWolf for a week - here\'s what\'s next',
      react: OnboardingDay7({ userName }),
    });

    if (error) {
      console.error('Failed to send onboarding day 7 email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending onboarding day 7 email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send trial ending soon email (Day 11 of trial)
 */
export async function sendTrialEndingSoonEmail(
  to: string,
  userName: string | undefined,
  daysRemaining: number
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const dayText = daysRemaining === 1 ? '1 day' : `${daysRemaining} days`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `Your Pro trial ends in ${dayText}`,
      react: TrialEndingSoon({ userName, daysRemaining }),
    });

    if (error) {
      console.error('Failed to send trial ending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending trial ending email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send milestone celebration email
 */
export async function sendMilestoneEmail(
  to: string,
  userName: string | undefined,
  milestoneType: 'scans_50' | 'qr_codes_5',
  milestoneValue: number
): Promise<EmailResult> {
  try {
    const resend = getResend();

    const subjects = {
      scans_50: 'Your QR codes hit 50 scans!',
      qr_codes_5: "You've created 5 QR codes!",
    };

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: subjects[milestoneType],
      react: MilestoneEmail({ userName, milestoneType, milestoneValue }),
    });

    if (error) {
      console.error('Failed to send milestone email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending milestone email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send 80% usage warning email
 */
export async function sendUsageLimitWarningEmail(
  to: string,
  userName: string | undefined,
  currentUsage: number,
  limit: number,
  currentPlan: 'free' | 'pro'
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const percentUsed = Math.round((currentUsage / limit) * 100);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `You've used ${percentUsed}% of your monthly scans`,
      react: UsageLimitWarning({ userName, currentUsage, limit, currentPlan }),
    });

    if (error) {
      console.error('Failed to send usage warning email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending usage warning email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

// Contact form subject label map
const CONTACT_SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  support: 'Technical Support',
  billing: 'Billing Question',
  feature: 'Feature Request',
  partnership: 'Partnership / Business',
  other: 'Other',
};

/**
 * Send contact form email to hello@qrwolf.com
 */
export async function sendContactFormEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<EmailResult> {
  try {
    const resend = getResend();
    const subjectLabel = CONTACT_SUBJECT_LABELS[subject] || subject;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: 'hello@qrwolf.com',
      replyTo: email,
      subject: `[Contact] ${subjectLabel}: from ${name}`,
      react: ContactFormEmail({
        name,
        email,
        subject: subjectLabel,
        message,
        submittedAt: new Date().toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      }),
    });

    if (error) {
      console.error('Failed to send contact form email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Error sending contact form email:', err);
    return { success: false, error: 'Failed to send email' };
  }
}
