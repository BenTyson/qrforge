import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles } from './BaseLayout';

interface UsageLimitWarningProps {
  userName?: string;
  currentUsage: number;
  limit: number;
  currentPlan: 'free' | 'pro';
}

export function UsageLimitWarning({ userName, currentUsage, limit, currentPlan }: UsageLimitWarningProps) {
  const displayName = userName || 'there';
  const percentUsed = Math.round((currentUsage / limit) * 100);
  const remaining = limit - currentUsage;
  const nextPlan = currentPlan === 'free' ? 'Pro' : 'Business';
  const nextLimit = currentPlan === 'free' ? '10,000' : 'Unlimited';

  return (
    <BaseLayout preview={`You've used ${percentUsed}% of your monthly scans`}>
      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={warningBadge}>
          {percentUsed}% USED
        </Text>
      </Section>

      <Text style={styles.heading}>
        Heads Up: Approaching Scan Limit
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        You&apos;ve used {currentUsage.toLocaleString()} of your {limit.toLocaleString()} monthly scans.
        That&apos;s {remaining.toLocaleString()} scans remaining until your limit resets next month.
      </Text>

      <Hr style={styles.divider} />

      {/* Usage bar */}
      <Section style={usageSection}>
        <div style={usageBarContainer}>
          <div style={{ ...usageBarFill, width: `${Math.min(percentUsed, 100)}%` }} />
        </div>
        <Text style={usageText}>
          {currentUsage.toLocaleString()} / {limit.toLocaleString()} scans
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        When you hit the limit, QR codes will show a &ldquo;limit reached&rdquo; message
        instead of redirecting. All scans resume next month automatically.
      </Text>

      <Text style={{ ...styles.paragraph, fontWeight: 'bold' }}>
        Need more scans?
      </Text>

      <Section style={styles.highlight}>
        <Text style={upgradeItem}>
          <span style={checkmark}>+</span>
          Upgrade to {nextPlan} for <strong>{nextLimit} scans/month</strong>
        </Text>
        {currentPlan === 'free' && (
          <>
            <Text style={upgradeItem}>
              <span style={checkmark}>+</span>
              Full scan analytics and device breakdown
            </Text>
            <Text style={upgradeItem}>
              <span style={checkmark}>+</span>
              50 dynamic QR codes included
            </Text>
          </>
        )}
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/settings" style={styles.button}>
          Upgrade to {nextPlan}
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.mutedText}>
        <strong>When does my limit reset?</strong>
        <br />
        Your scan count resets on the first day of each month. You can track
        your current usage in your{' '}
        <Link href="https://qrwolf.com/dashboard" style={styles.link}>
          dashboard
        </Link>.
      </Text>
    </BaseLayout>
  );
}

const warningBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#f59e0b',
  color: '#000000',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 16px',
  borderRadius: '20px',
  margin: '0',
};

const usageSection: React.CSSProperties = {
  margin: '24px 0',
};

const usageBarContainer: React.CSSProperties = {
  height: '12px',
  backgroundColor: '#1e293b',
  borderRadius: '6px',
  overflow: 'hidden',
};

const usageBarFill: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#f59e0b',
  borderRadius: '6px',
  transition: 'width 0.3s ease',
};

const usageText: React.CSSProperties = {
  fontSize: '14px',
  color: '#94a3b8',
  textAlign: 'center',
  marginTop: '8px',
};

const upgradeItem: React.CSSProperties = {
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

export default UsageLimitWarning;
