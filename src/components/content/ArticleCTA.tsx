'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ArticleCTAProps {
  /** Type of QR code to link to (e.g., 'url', 'wifi', 'vcard') */
  qrType?: string;
  /** Custom title for the CTA */
  title?: string;
  /** Custom description for the CTA */
  description?: string;
  /** Variant: 'inline' (within content) or 'banner' (full-width) */
  variant?: 'inline' | 'banner';
  /** Custom button text */
  buttonText?: string;
}

// Map QR types to their display names and descriptions
const QR_TYPE_CONFIG: Record<string, { name: string; description: string }> = {
  url: { name: 'URL', description: 'Link to any website or landing page' },
  wifi: { name: 'WiFi', description: 'Let guests connect with a single scan' },
  vcard: { name: 'vCard', description: 'Share your contact info instantly' },
  email: { name: 'Email', description: 'Pre-compose emails for easy sending' },
  sms: { name: 'SMS', description: 'Pre-filled text messages' },
  phone: { name: 'Phone', description: 'One-tap phone calls' },
  menu: { name: 'Menu', description: 'Digital menus for restaurants' },
  pdf: { name: 'PDF', description: 'Share documents easily' },
  social: { name: 'Social Links', description: 'All your profiles in one place' },
  'google-review': { name: 'Google Review', description: 'Get more reviews from customers' },
  event: { name: 'Event', description: 'Add events to calendars instantly' },
  video: { name: 'Video', description: 'Share videos from YouTube, Vimeo, and more' },
  business: { name: 'Business Card', description: 'Digital business cards with all your info' },
  geo: { name: 'Location', description: 'Share map locations and directions' },
};

export function ArticleCTA({
  qrType,
  title,
  description,
  variant = 'inline',
  buttonText,
}: ArticleCTAProps) {
  const config = qrType ? QR_TYPE_CONFIG[qrType] : null;

  const displayTitle = title || (config ? `Create a ${config.name} QR Code` : 'Create Your QR Code');
  const displayDescription =
    description || (config?.description || 'Generate professional QR codes in seconds');
  const displayButtonText = buttonText || (config ? `Create ${config.name} QR` : 'Create QR Code');

  // Build the destination URL
  const href = qrType ? `/qr-codes/new?type=${qrType}` : '/qr-codes/new';

  // Track click with Plausible (if available)
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as unknown as { plausible?: (event: string, options?: { props?: Record<string, string> }) => void }).plausible) {
      (window as unknown as { plausible: (event: string, options?: { props?: Record<string, string> }) => void }).plausible('Article CTA Click', {
        props: { qrType: qrType || 'general', variant },
      });
    }
  };

  if (variant === 'banner') {
    return (
      <div className="my-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-1">{displayTitle}</h3>
            <p className="text-muted-foreground text-sm">{displayDescription}</p>
          </div>
          <Link href={href} onClick={handleClick}>
            <Button className="whitespace-nowrap">
              {displayButtonText}
              <ArrowRightIcon className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <Card className="my-6 p-5 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <QRIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{displayTitle}</h4>
          <p className="text-muted-foreground text-sm mb-3">{displayDescription}</p>
          <Link href={href} onClick={handleClick}>
            <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10">
              {displayButtonText}
              <ArrowRightIcon className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function QRIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default ArticleCTA;
