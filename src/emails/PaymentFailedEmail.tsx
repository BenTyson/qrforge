import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface PaymentFailedEmailProps {
  userName?: string;
  plan: 'pro' | 'business';
  amount: string;
  retryDate?: string;
}

export function PaymentFailedEmail({
  userName,
  plan,
  amount,
  retryDate
}: PaymentFailedEmailProps) {
  const displayName = userName || 'there';
  const planName = plan === 'pro' ? 'Pro' : 'Business';

  return (
    <BaseLayout preview="Action required: Your QRWolf payment could not be processed">
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={warningBadge}>
          Payment Issue
        </Text>
      </Section>

      <Text style={styles.heading}>
        Payment Failed
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        We were unable to process your payment of <strong>{amount}</strong> for your
        QRWolf {planName} subscription.
      </Text>

      <Section style={styles.highlight}>
        <Text style={detailText}>
          This can happen for a few reasons:
        </Text>
        <Text style={listItem}>• Your card has expired</Text>
        <Text style={listItem}>• Insufficient funds</Text>
        <Text style={listItem}>• Your bank declined the charge</Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/settings" style={styles.button}>
          Update Payment Method
        </Link>
      </Section>

      {retryDate && (
        <Text style={styles.mutedText}>
          We'll automatically retry the payment on <strong>{retryDate}</strong>.
          Please update your payment method before then to avoid any interruption
          to your service.
        </Text>
      )}

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        <strong>What happens if payment fails again?</strong>
      </Text>

      <Text style={styles.mutedText}>
        If we're unable to collect payment after a few attempts, your subscription
        will be downgraded to the Free plan. Your QR codes will remain, but you'll
        lose access to premium features like analytics and dynamic QR updates.
      </Text>

      <Text style={styles.mutedText}>
        Questions? Reply to this email or contact us at{' '}
        <Link href="mailto:hello@qrwolf.com" style={styles.link}>
          hello@qrwolf.com
        </Link>
      </Text>

      <Text style={styles.paragraph}>
        Thanks for being a QRWolf subscriber,<br />
        <span style={{ color: colors.primary }}>The QRWolf Team</span>
      </Text>
    </BaseLayout>
  );
}

const warningBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#ef4444',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 20px',
  borderRadius: '20px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const detailText: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '0 0 12px 0',
};

const listItem: React.CSSProperties = {
  fontSize: '14px',
  color: colors.textMuted,
  margin: '4px 0',
  paddingLeft: '8px',
};

export default PaymentFailedEmail;
