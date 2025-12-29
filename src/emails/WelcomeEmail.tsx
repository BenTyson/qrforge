import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface WelcomeEmailProps {
  userName?: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  const displayName = userName || 'there';

  return (
    <BaseLayout preview="Welcome to QRWolf - Let's create your first QR code!">
      <Text style={styles.heading}>
        Welcome to QRWolf!
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        Thanks for joining QRWolf! You now have access to professional QR codes
        with real-time analytics and powerful customization options.
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/qr-codes/new" style={styles.button}>
          Create Your First QR Code
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>
        Here's what you can do:
      </Text>

      <Section style={styles.highlight}>
        <Text style={featureItem}>
          <span style={checkmark}>✓</span> Generate 11 types of QR codes
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>✓</span> Customize colors and styles
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>✓</span> Download in PNG and SVG formats
        </Text>
        <Text style={featureItem}>
          <span style={checkmark}>✓</span> Upgrade to Pro for analytics & dynamic codes
        </Text>
      </Section>

      <Text style={styles.mutedText}>
        Need help getting started? Check out our{' '}
        <Link href="https://qrwolf.com/contact" style={styles.link}>
          support page
        </Link>{' '}
        or reply to this email.
      </Text>

      <Text style={styles.paragraph}>
        Happy creating!<br />
        <span style={{ color: colors.primary }}>The QRWolf Team</span>
      </Text>
    </BaseLayout>
  );
}

const featureItem: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '8px 0',
  paddingLeft: '8px',
};

const checkmark: React.CSSProperties = {
  color: '#14b8a6',
  marginRight: '8px',
};

export default WelcomeEmail;
