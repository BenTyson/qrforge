import { Hr, Section, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout, styles, colors } from './BaseLayout';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export function ContactFormEmail({
  name,
  email,
  subject,
  message,
  submittedAt,
}: ContactFormEmailProps) {
  return (
    <BaseLayout preview={`New contact from ${name}: ${subject}`}>
      <Text style={styles.heading}>
        New Contact Form Submission
      </Text>

      <Section style={styles.highlight}>
        <Text style={senderInfo}>
          <span style={label}>From:</span> {name}
        </Text>
        <Text style={senderInfo}>
          <span style={label}>Email:</span> {email}
        </Text>
      </Section>

      <Text style={subjectStyle}>
        <span style={label}>Subject:</span> {subject}
      </Text>

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        <span style={label}>Message:</span>
      </Text>

      <Text style={messageStyle}>
        {message}
      </Text>

      <Hr style={styles.divider} />

      <Text style={timestampStyle}>
        Submitted on {submittedAt}
      </Text>
    </BaseLayout>
  );
}

const senderInfo: React.CSSProperties = {
  fontSize: '16px',
  color: '#fafafa',
  margin: '8px 0',
};

const label: React.CSSProperties = {
  color: colors.textMuted,
};

const subjectStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#fafafa',
  margin: '16px 0 0 0',
};

const messageStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#fafafa',
  margin: '0 0 16px 0',
  whiteSpace: 'pre-wrap',
};

const timestampStyle: React.CSSProperties = {
  fontSize: '12px',
  color: colors.textMuted,
  margin: '0',
};

export default ContactFormEmail;
