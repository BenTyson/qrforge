import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface AccountDeletionEmailProps {
  userName?: string;
  confirmationLink: string;
  expiresIn: string;
}

export function AccountDeletionEmail({
  userName,
  confirmationLink,
  expiresIn,
}: AccountDeletionEmailProps) {
  const displayName = userName || 'there';

  return (
    <BaseLayout preview="Confirm your QRWolf account deletion request">
      <Text style={styles.heading}>
        Account Deletion Request
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        We received a request to permanently delete your QRWolf account. If you made this
        request, click the button below to confirm.
      </Text>

      <Section style={warningBox}>
        <Text style={warningTitle}>
          This action is irreversible
        </Text>
        <Text style={warningText}>
          Deleting your account will permanently remove:
        </Text>
        <ul style={warningList}>
          <li>All your QR codes (static and dynamic)</li>
          <li>All scan analytics and history</li>
          <li>All folders and organization</li>
          <li>All API keys</li>
          <li>Your profile and account data</li>
        </ul>
        <Text style={warningText}>
          If you have an active subscription, it will be canceled immediately.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href={confirmationLink} style={deleteButton}>
          Confirm Account Deletion
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.mutedText}>
        This confirmation link will expire in {expiresIn}. If you didn&apos;t request this
        deletion, you can safely ignore this email - your account will remain active.
      </Text>

      <Text style={styles.mutedText}>
        If you have concerns about your account security, please{' '}
        <Link href="https://qrwolf.com/contact" style={styles.link}>
          contact our support team
        </Link>{' '}
        immediately.
      </Text>

      <Text style={styles.paragraph}>
        Best regards,<br />
        <span style={{ color: colors.primary }}>The QRWolf Team</span>
      </Text>
    </BaseLayout>
  );
}

const warningBox: React.CSSProperties = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  border: '1px solid rgba(239, 68, 68, 0.3)',
};

const warningTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#ef4444',
  margin: '0 0 8px 0',
};

const warningText: React.CSSProperties = {
  fontSize: '14px',
  color: '#fafafa',
  margin: '8px 0',
};

const warningList: React.CSSProperties = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: '8px 0',
  paddingLeft: '20px',
};

const deleteButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#ef4444',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '14px 28px',
  borderRadius: '8px',
  textAlign: 'center',
};

export default AccountDeletionEmail;
