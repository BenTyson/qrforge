import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface TeamInviteEmailProps {
  inviterName: string;
  teamName: string;
  inviteUrl: string;
  role?: string;
}

export function TeamInviteEmail({
  inviterName,
  teamName,
  inviteUrl,
  role = 'member'
}: TeamInviteEmailProps) {
  return (
    <BaseLayout preview={`${inviterName} invited you to join ${teamName} on QRWolf`}>
      <Text style={styles.heading}>
        You're Invited!
      </Text>

      <Text style={styles.paragraph}>
        <strong>{inviterName}</strong> has invited you to join their team on QRWolf.
      </Text>

      <Section style={styles.highlight}>
        <Text style={teamInfo}>
          <span style={label}>Team:</span> {teamName}
        </Text>
        <Text style={teamInfo}>
          <span style={label}>Your Role:</span>{' '}
          <span style={roleBadge}>{role}</span>
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        Join the team to collaborate on QR codes, share analytics, and work together
        on your QR marketing campaigns.
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href={inviteUrl} style={styles.button}>
          Accept Invitation
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.mutedText}>
        This invitation expires in 7 days. If you don't want to join this team,
        you can safely ignore this email.
      </Text>

      <Text style={styles.mutedText}>
        If you weren't expecting this invitation or have concerns, please contact us at{' '}
        <Link href="mailto:hello@qrwolf.com" style={styles.link}>
          hello@qrwolf.com
        </Link>
      </Text>
    </BaseLayout>
  );
}

const teamInfo: React.CSSProperties = {
  fontSize: '16px',
  color: '#fafafa',
  margin: '8px 0',
};

const label: React.CSSProperties = {
  color: colors.textMuted,
};

const roleBadge: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: colors.primary,
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '2px 8px',
  borderRadius: '4px',
  textTransform: 'capitalize',
};

export default TeamInviteEmail;
