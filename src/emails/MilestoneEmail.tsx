import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface MilestoneEmailProps {
  userName?: string;
  milestoneType: 'scans_50' | 'qr_codes_5';
  milestoneValue: number;
}

export function MilestoneEmail({ userName, milestoneType, milestoneValue }: MilestoneEmailProps) {
  const displayName = userName || 'there';

  const content = getMilestoneContent(milestoneType, milestoneValue);

  return (
    <BaseLayout preview={content.preview}>
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={celebrationBadge}>
          {content.badge}
        </Text>
      </Section>

      <Text style={styles.heading}>
        {content.heading}
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        {content.body}
      </Text>

      <Hr style={styles.divider} />

      <Section style={styles.highlight}>
        <Text style={statDisplay}>
          <span style={statNumber}>{milestoneValue}</span>
          <span style={statLabel}>{content.statLabel}</span>
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        {content.cta}
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href={content.buttonUrl} style={styles.button}>
          {content.buttonText}
        </Link>
      </Section>

      {content.proTip && (
        <Text style={styles.mutedText}>
          <strong>Pro tip:</strong> {content.proTip}
        </Text>
      )}
    </BaseLayout>
  );
}

function getMilestoneContent(type: string, _value: number) {
  switch (type) {
    case 'scans_50':
      return {
        preview: 'Congrats! Your QR codes just hit 50 scans',
        badge: '50 SCANS',
        heading: 'Your QR Codes Are Getting Noticed!',
        body: 'Your QR codes just crossed 50 scans total. That\'s real engagement from real people discovering your content.',
        statLabel: 'total scans',
        cta: 'Want to see where those scans came from and which devices people used?',
        buttonUrl: 'https://qrwolf.com/analytics',
        buttonText: 'View Your Analytics',
        proTip: 'With Pro, you get detailed analytics including location data, device breakdown, and scan trends over time.',
      };

    case 'qr_codes_5':
      return {
        preview: 'You\'ve created 5 QR codes - nice!',
        badge: '5 QR CODES',
        heading: 'You\'re on a Roll!',
        body: 'You\'ve created 5 QR codes! You\'re clearly finding great ways to use QRWolf. Have you tried our template gallery yet?',
        statLabel: 'QR codes created',
        cta: 'Our template gallery has 40+ pre-designed styles for restaurants, events, business cards, and more.',
        buttonUrl: 'https://qrwolf.com/templates',
        buttonText: 'Browse Templates',
        proTip: 'Templates work with any QR type. Pick a style, add your content, and download in seconds.',
      };

    default:
      return {
        preview: 'Milestone reached!',
        badge: 'MILESTONE',
        heading: 'Congratulations!',
        body: 'You\'ve reached an important milestone with QRWolf.',
        statLabel: 'achieved',
        cta: 'Keep going!',
        buttonUrl: 'https://qrwolf.com/dashboard',
        buttonText: 'Go to Dashboard',
        proTip: null,
      };
  }
}

const celebrationBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: colors.primary,
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 16px',
  borderRadius: '20px',
  margin: '0',
};

const statDisplay: React.CSSProperties = {
  textAlign: 'center',
  margin: '0',
};

const statNumber: React.CSSProperties = {
  display: 'block',
  fontSize: '48px',
  fontWeight: 'bold',
  color: colors.primary,
  lineHeight: '1',
};

const statLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  color: colors.textMuted,
  marginTop: '8px',
};

export default MilestoneEmail;
