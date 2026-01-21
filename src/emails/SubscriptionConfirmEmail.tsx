import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface SubscriptionConfirmEmailProps {
  userName?: string;
  plan: 'pro' | 'business';
  billingCycle: 'monthly' | 'yearly';
  amount: string;
  nextBillingDate: string;
}

const planFeatures = {
  pro: [
    '50 Dynamic QR Codes',
    'Full Analytics Dashboard',
    'Logo Upload & Branding',
    'File Uploads (PDF, Images, Video, Audio)',
    'Landing Pages (Menu, Business, Links, Coupon, Social)',
    'Expiration Dates & Password Protection',
    'Custom Patterns & Shapes',
    'Gradient Colors',
    'Decorative Frames',
  ],
  business: [
    'Unlimited Dynamic QR Codes',
    'Everything in Pro',
    'Bulk QR Generation',
    'REST API Access',
    'Team Members (up to 3)',
    'Priority Support',
  ],
};

export function SubscriptionConfirmEmail({
  userName,
  plan,
  billingCycle,
  amount,
  nextBillingDate
}: SubscriptionConfirmEmailProps) {
  const displayName = userName || 'there';
  const planName = plan === 'pro' ? 'Pro' : 'Business';
  const features = planFeatures[plan];

  return (
    <BaseLayout preview={`Welcome to QRWolf ${planName} - Your subscription is active!`}>
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={planBadge}>
          {planName} Plan
        </Text>
      </Section>

      <Text style={styles.heading}>
        You&apos;re All Set!
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        Thank you for upgrading to QRWolf <strong>{planName}</strong>! Your subscription
        is now active and you have access to all premium features.
      </Text>

      <Section style={styles.highlight}>
        <Text style={subscriptionDetail}>
          <span style={label}>Plan:</span> {planName} ({billingCycle})
        </Text>
        <Text style={subscriptionDetail}>
          <span style={label}>Amount:</span> {amount}
        </Text>
        <Text style={subscriptionDetail}>
          <span style={label}>Next Billing:</span> {nextBillingDate}
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>
        What&apos;s included in your {planName} plan:
      </Text>

      <Section style={{ marginBottom: '24px' }}>
        {features.map((feature, index) => (
          <Text key={index} style={featureItem}>
            <span style={checkmark}>✓</span> {feature}
          </Text>
        ))}
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/qr-codes/new" style={styles.button}>
          Create a QR Code
        </Link>
      </Section>

      <Text style={styles.mutedText}>
        Manage your subscription anytime from your{' '}
        <Link href="https://qrwolf.com/settings" style={styles.link}>
          account settings
        </Link>
        .
      </Text>

      <Text style={styles.paragraph}>
        Welcome aboard!<br />
        <span style={{ color: colors.primary }}>The QRWolf Team</span>
      </Text>
    </BaseLayout>
  );
}

const planBadge: React.CSSProperties = {
  display: 'inline-block',
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 20px',
  borderRadius: '20px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const subscriptionDetail: React.CSSProperties = {
  fontSize: '16px',
  color: '#fafafa',
  margin: '8px 0',
};

const label: React.CSSProperties = {
  color: colors.textMuted,
};

const featureItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '8px 0',
  paddingLeft: '8px',
};

const checkmark: React.CSSProperties = {
  color: colors.primary,
  marginRight: '8px',
};

export default SubscriptionConfirmEmail;
