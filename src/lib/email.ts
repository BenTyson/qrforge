import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { TeamInviteEmail } from '@/emails/TeamInviteEmail';
import { SubscriptionConfirmEmail } from '@/emails/SubscriptionConfirmEmail';
import { PaymentFailedEmail } from '@/emails/PaymentFailedEmail';

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
