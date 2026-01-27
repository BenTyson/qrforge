import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles } from './BaseLayout';

interface TrialEndingSoonProps {
  userName?: string;
  daysRemaining: number;
}

export function TrialEndingSoon({ userName, daysRemaining }: TrialEndingSoonProps) {
  const displayName = userName || 'there';
  const dayText = daysRemaining === 1 ? '1 day' : `${daysRemaining} days`;

  return (
    <BaseLayout preview={`Your Pro trial ends in ${dayText}`}>
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={urgentBadge}>
          {dayText.toUpperCase()} LEFT
        </Text>
      </Section>

      <Text style={styles.heading}>
        Your Pro Trial is Ending Soon
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        Just a heads up: your free Pro trial expires in {dayText}. After that,
        your account will automatically switch to the Free tier.
      </Text>

      <Hr style={styles.divider} />

      <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>
        Here&apos;s what you&apos;ll lose access to:
      </Text>

      <Section style={styles.highlight}>
        <Text style={lostFeature}>
          <span style={xMark}>-</span> Dynamic QR codes (content can&apos;t be updated)
        </Text>
        <Text style={lostFeature}>
          <span style={xMark}>-</span> Scan analytics and insights
        </Text>
        <Text style={lostFeature}>
          <span style={xMark}>-</span> Logo on QR codes
        </Text>
        <Text style={lostFeature}>
          <span style={xMark}>-</span> 10,000 monthly scans (drops to 100)
        </Text>
        <Text style={lostFeature}>
          <span style={xMark}>-</span> Custom landing pages
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/settings" style={styles.button}>
          Keep Pro - $9/month
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.mutedText}>
        <strong>What happens to my dynamic QR codes?</strong>
      </Text>
      <Text style={styles.mutedText}>
        They&apos;ll still work, but you won&apos;t be able to edit their destinations
        or create new ones. All your scan history stays saved - if you upgrade later,
        everything will be there.
      </Text>

      <Text style={{ ...styles.mutedText, marginTop: '16px' }}>
        Questions? Just reply to this email.
      </Text>
    </BaseLayout>
  );
}

const urgentBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f59e0b',
  color: '#000000',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 12px',
  borderRadius: '4px',
  margin: '0',
};

const lostFeature: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '10px 0',
  paddingLeft: '8px',
};

const xMark: React.CSSProperties = {
  color: '#ef4444',
  marginRight: '10px',
  fontWeight: 'bold',
};

export default TrialEndingSoon;
