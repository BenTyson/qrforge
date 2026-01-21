import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface ScanLimitReachedEmailProps {
  userName?: string;
  currentPlan: 'free' | 'pro';
  scanLimit: number;
  upgradeUrl?: string;
}

export function ScanLimitReachedEmail({
  userName,
  currentPlan,
  scanLimit,
  upgradeUrl = 'https://qrwolf.com/plans',
}: ScanLimitReachedEmailProps) {
  const displayName = userName || 'there';
  const planName = currentPlan === 'free' ? 'Free' : 'Pro';

  return (
    <BaseLayout preview={`Your QR codes have reached ${scanLimit.toLocaleString()} scans this month`}>
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={alertBadge}>
          Scan Limit Reached
        </Text>
      </Section>

      <Text style={styles.heading}>
        Your QR Codes Hit Their Limit
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        Great news - your QR codes are getting attention! You&apos;ve reached{' '}
        <strong>{scanLimit.toLocaleString()} scans</strong> this month on your{' '}
        <strong>{planName} plan</strong>.
      </Text>

      <Section style={styles.highlight}>
        <Text style={highlightText}>
          Until the limit resets next month, new scans will show a &ldquo;limit reached&rdquo;
          message instead of redirecting to your destination.
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>
        Want to keep the momentum going?
      </Text>

      <Text style={styles.paragraph}>
        Upgrade your plan to unlock more scans and keep your QR codes working:
      </Text>

      <Section style={{ marginBottom: '24px' }}>
        <Text style={featureItem}>
          <span style={checkmark}>✓</span> <strong>Pro:</strong> 10,000 scans/month + analytics
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>✓</span> <strong>Business:</strong> Unlimited scans + API access
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href={upgradeUrl} style={styles.button}>
          Upgrade Now
        </Link>
      </Section>

      <Text style={styles.mutedText}>
        Your scan limit will automatically reset on the 1st of next month.
        You can view your usage anytime in your{' '}
        <Link href="https://qrwolf.com/dashboard" style={styles.link}>
          dashboard
        </Link>
        .
      </Text>

      <Text style={styles.paragraph}>
        Thanks for using QRWolf!<br />
        <span style={{ color: colors.primary }}>The QRWolf Team</span>
      </Text>
    </BaseLayout>
  );
}

const alertBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 20px',
  borderRadius: '20px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const highlightText: React.CSSProperties = {
  fontSize: '14px',
  color: '#f59e0b',
  margin: '0',
  lineHeight: '22px',
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

export default ScanLimitReachedEmail;
