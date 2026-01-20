import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface DataExportReadyEmailProps {
  userName?: string;
  exportDate: string;
}

export function DataExportReadyEmail({ userName, exportDate }: DataExportReadyEmailProps) {
  const displayName = userName || 'there';

  return (
    <BaseLayout preview="Your QRWolf data export is ready for download">
      <Text style={styles.heading}>
        Your Data Export is Ready
      </Text>

      <Text style={styles.paragraph}>
        Hey {displayName},
      </Text>

      <Text style={styles.paragraph}>
        Your data export request from {exportDate} has been processed. You can download
        your data from your account settings page.
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Link href="https://qrwolf.com/settings" style={styles.button}>
          Download Your Data
        </Link>
      </Section>

      <Hr style={styles.divider} />

      <Section style={styles.highlight}>
        <Text style={{ ...styles.mutedText, margin: 0 }}>
          <strong style={{ color: colors.text }}>What&apos;s included:</strong>
        </Text>
        <Text style={{ ...styles.mutedText, margin: '8px 0 0 0' }}>
          Your profile information, QR codes, scan analytics, folders, and API keys.
          All data is provided in JSON format for portability.
        </Text>
      </Section>

      <Text style={styles.mutedText}>
        The download link in your settings will remain available for 24 hours. After that,
        you can request a new export.
      </Text>

      <Text style={styles.mutedText}>
        This export was requested as part of your GDPR data access rights. If you didn&apos;t
        request this export, please{' '}
        <Link href="https://qrwolf.com/contact" style={styles.link}>
          contact support
        </Link>
        .
      </Text>

      <Text style={styles.paragraph}>
        Best regards,<br />
        <span style={{ color: colors.primary }}>The QRWolf Team</span>
      </Text>
    </BaseLayout>
  );
}

export default DataExportReadyEmail;
