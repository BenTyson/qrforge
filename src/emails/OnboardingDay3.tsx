import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface OnboardingDay3Props {
  userName?: string;
}

export function OnboardingDay3({ userName }: OnboardingDay3Props) {
  const displayName = userName || 'there';

  return (
    <BaseLayout preview="3 features you might not know about">
      <Text style={styles.heading}>
        Did You Know?
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        Here are three powerful features that most QRWolf users discover after
        a few weeks. We thought you&apos;d want to know about them now:
      </Text>

      <Hr style={styles.divider} />

      <Section style={featureBlock}>
        <Text style={featureTitle}>
          <span style={featureEmoji}>1.</span> Dynamic QR Codes
        </Text>
        <Text style={featureDescription}>
          Change where your QR code points without reprinting. Perfect for menus,
          marketing materials, and anything you might need to update later.
          <span style={{ color: colors.primary }}> (Pro feature)</span>
        </Text>
      </Section>

      <Section style={featureBlock}>
        <Text style={featureTitle}>
          <span style={featureEmoji}>2.</span> Scan Analytics
        </Text>
        <Text style={featureDescription}>
          See exactly when and where your QR codes are scanned. Track device types,
          countries, and scan trends over time.
          <span style={{ color: colors.primary }}> (Pro feature)</span>
        </Text>
      </Section>

      <Section style={featureBlock}>
        <Text style={featureTitle}>
          <span style={featureEmoji}>3.</span> Template Gallery
        </Text>
        <Text style={featureDescription}>
          Choose from 40+ pre-designed templates with professional styling.
          Restaurant menus, business cards, event badges, and more - all free to use.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/templates" style={styles.button}>
          Browse Templates
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.mutedText}>
        Want unlimited dynamic codes and full analytics?{' '}
        <Link href="https://qrwolf.com/settings" style={styles.link}>
          Upgrade to Pro
        </Link>{' '}
        - plans start at $9/month.
      </Text>

      <Text style={unsubscribeText}>
        <Link href="https://qrwolf.com/settings?unsubscribe=marketing" style={styles.link}>
          Unsubscribe from tips
        </Link>
      </Text>
    </BaseLayout>
  );
}

const featureBlock: React.CSSProperties = {
  marginBottom: '20px',
};

const featureTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#fafafa',
  margin: '0 0 8px 0',
};

const featureEmoji: React.CSSProperties = {
  color: colors.primary,
  marginRight: '8px',
};

const featureDescription: React.CSSProperties = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: '0',
  lineHeight: '22px',
};

const unsubscribeText: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  textAlign: 'center',
  marginTop: '24px',
};

export default OnboardingDay3;
