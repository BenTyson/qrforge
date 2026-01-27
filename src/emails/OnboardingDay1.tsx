import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles } from './BaseLayout';

interface OnboardingDay1Props {
  userName?: string;
}

export function OnboardingDay1({ userName }: OnboardingDay1Props) {
  const displayName = userName || 'there';

  return (
    <BaseLayout preview="Create your first QR code in 60 seconds">
      <Text style={styles.heading}>
        Ready to Create Your First QR Code?
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        You signed up yesterday but haven&apos;t created a QR code yet. No worries -
        it takes less than a minute, and we&apos;ll walk you through it.
      </Text>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>
        Three simple steps:
      </Text>

      <Section style={styles.highlight}>
        <Text style={stepItem}>
          <span style={stepNumber}>1</span>
          <strong>Choose your content type</strong> - URL, WiFi, vCard, or 20+ other options
        </Text>
        <Text style={stepItem}>
          <span style={stepNumber}>2</span>
          <strong>Enter your details</strong> - paste a link or fill in the form
        </Text>
        <Text style={stepItem}>
          <span style={stepNumber}>3</span>
          <strong>Download</strong> - get your QR code as PNG or SVG
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/qr-codes/new" style={styles.button}>
          Create Your First QR Code
        </Link>
      </Section>

      <Text style={styles.mutedText}>
        <strong>Pro tip:</strong> Try our WiFi QR code to let guests connect
        to your network with a single scan - no typing passwords.
      </Text>

      <Hr style={styles.divider} />

      <Text style={styles.mutedText}>
        Questions? Just reply to this email - we read every message.
      </Text>

      <Text style={unsubscribeText}>
        <Link href="https://qrwolf.com/settings?unsubscribe=marketing" style={styles.link}>
          Unsubscribe from tips
        </Link>
      </Text>
    </BaseLayout>
  );
}

const stepItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '12px 0',
  paddingLeft: '8px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
};

const stepNumber: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: '#14b8a6',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  flexShrink: 0,
};

const unsubscribeText: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  textAlign: 'center',
  marginTop: '24px',
};

export default OnboardingDay1;
