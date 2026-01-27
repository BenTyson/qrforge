import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles } from './BaseLayout';

interface OnboardingDay7Props {
  userName?: string;
}

export function OnboardingDay7({ userName }: OnboardingDay7Props) {
  const displayName = userName || 'there';

  return (
    <BaseLayout preview="You've been using QRWolf for a week - here's what's next">
      <Text style={styles.heading}>
        One Week with QRWolf
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        It&apos;s been a week since you joined QRWolf. We hope you&apos;ve
        found it useful! If you&apos;re ready to unlock the full potential
        of your QR codes, here&apos;s what Pro gives you:
      </Text>

      <Hr style={styles.divider} />

      <Section style={styles.highlight}>
        <Text style={featureItem}>
          <span style={checkmark}>+</span>
          <strong>50 Dynamic QR codes</strong> - update destinations anytime
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>+</span>
          <strong>10,000 scans/month</strong> - 100x the free limit
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>+</span>
          <strong>Full analytics</strong> - devices, locations, trends
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>+</span>
          <strong>Add your logo</strong> - branded QR codes
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>+</span>
          <strong>Custom landing pages</strong> - no external links needed
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/settings" style={styles.button}>
          Upgrade to Pro - $9/month
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontWeight: 'bold', marginBottom: '16px' }}>
        What others are saying:
      </Text>

      <Section style={testimonialBlock}>
        <Text style={testimonialQuote}>
          &ldquo;We switched from QR Code Monkey to QRWolf and haven&apos;t looked back.
          The analytics alone are worth the upgrade.&rdquo;
        </Text>
        <Text style={testimonialAuthor}>
          - Sarah Chen, Marketing Director at TechStart
        </Text>
      </Section>

      <Section style={testimonialBlock}>
        <Text style={testimonialQuote}>
          &ldquo;I use dynamic QR codes on all my restaurant menus. When prices change,
          I just update the link - no reprinting needed.&rdquo;
        </Text>
        <Text style={testimonialAuthor}>
          - Marco Rodriguez, Owner of Bella Vista
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.mutedText}>
        Not ready to upgrade? No problem - your free account never expires.
        We&apos;re here whenever you need more power.
      </Text>

      <Text style={unsubscribeText}>
        <Link href="https://qrwolf.com/settings?unsubscribe=marketing" style={styles.link}>
          Unsubscribe from tips
        </Link>
      </Text>
    </BaseLayout>
  );
}

const featureItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '10px 0',
  paddingLeft: '8px',
};

const checkmark: React.CSSProperties = {
  color: '#14b8a6',
  marginRight: '10px',
  fontWeight: 'bold',
};

const testimonialBlock: React.CSSProperties = {
  backgroundColor: '#0c1222',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  borderLeft: '3px solid #14b8a6',
};

const testimonialQuote: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '0 0 8px 0',
  fontStyle: 'italic',
  lineHeight: '22px',
};

const testimonialAuthor: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
};

const unsubscribeText: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  textAlign: 'center',
  marginTop: '24px',
};

export default OnboardingDay7;
