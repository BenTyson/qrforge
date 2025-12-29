import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

// QRWolf Brand Colors
export const colors = {
  primary: '#14b8a6',      // Teal
  accent: '#06b6d4',       // Cyan
  background: '#0c1222',   // Dark navy
  card: '#151d2e',         // Card background
  text: '#fafafa',         // White text
  textMuted: '#94a3b8',    // Muted text
  border: 'rgba(148, 163, 184, 0.15)',
};

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Link href="https://qrwolf.com" style={logoLink}>
              <Img
                src="https://qrwolf.com/QRWolf_Logo_Color.png"
                width="48"
                height="48"
                alt="QRWolf"
                style={logoImage}
              />
              <Text style={logoText}>QRWolf</Text>
            </Link>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              QRWolf - Professional QR Codes with Analytics
            </Text>
            <Text style={footerLinks}>
              <Link href="https://qrwolf.com" style={footerLink}>Website</Link>
              {' • '}
              <Link href="https://qrwolf.com/dashboard" style={footerLink}>Dashboard</Link>
              {' • '}
              <Link href="https://qrwolf.com/contact" style={footerLink}>Contact</Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} QRWolf. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: colors.background,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logoLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
};

const logoImage: React.CSSProperties = {
  borderRadius: '8px',
};

const logoText: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: colors.text,
  marginLeft: '12px',
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const content: React.CSSProperties = {
  backgroundColor: colors.card,
  borderRadius: '12px',
  padding: '32px',
  border: `1px solid ${colors.border}`,
};

const footer: React.CSSProperties = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText: React.CSSProperties = {
  fontSize: '14px',
  color: colors.textMuted,
  margin: '0 0 8px 0',
};

const footerLinks: React.CSSProperties = {
  fontSize: '12px',
  color: colors.textMuted,
  margin: '0 0 16px 0',
};

const footerLink: React.CSSProperties = {
  color: colors.primary,
  textDecoration: 'none',
};

const footerCopyright: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textMuted,
  margin: '0',
};

// Shared component styles for use in email templates
export const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: colors.text,
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  paragraph: {
    fontSize: '16px',
    lineHeight: '24px',
    color: colors.text,
    margin: '0 0 16px 0',
  } as React.CSSProperties,
  mutedText: {
    fontSize: '14px',
    lineHeight: '20px',
    color: colors.textMuted,
    margin: '0 0 16px 0',
  } as React.CSSProperties,
  button: {
    display: 'inline-block',
    backgroundColor: colors.primary,
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  buttonSecondary: {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: colors.primary,
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    padding: '12px 26px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    border: `2px solid ${colors.primary}`,
  } as React.CSSProperties,
  divider: {
    borderTop: `1px solid ${colors.border}`,
    margin: '24px 0',
  } as React.CSSProperties,
  highlight: {
    backgroundColor: colors.background,
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  } as React.CSSProperties,
  link: {
    color: colors.primary,
    textDecoration: 'none',
  } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    backgroundColor: colors.primary,
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    padding: '4px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
};

export default BaseLayout;
