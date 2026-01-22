'use client';

import { Button } from '@/components/ui/button';

interface VCardContent {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  title?: string;
  website?: string;
  address?: string;
}

interface VCardActionsProps {
  content: VCardContent;
  fullName: string;
}

export function VCardActions({ content, fullName }: VCardActionsProps) {
  const handleDownload = () => {
    // Generate vCard format
    const vcard = generateVCard(content);

    // Create and trigger download
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fullName || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddToContacts = () => {
    // On mobile, this will open the native contacts app
    handleDownload();
  };

  return (
    <Button onClick={handleAddToContacts} className="w-full" size="lg">
      <DownloadIcon className="w-5 h-5 mr-2" />
      Add to Contacts
    </Button>
  );
}

function generateVCard(content: VCardContent): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Name
  if (content.firstName || content.lastName) {
    lines.push(`N:${content.lastName || ''};${content.firstName || ''};;;`);
    lines.push(`FN:${[content.firstName, content.lastName].filter(Boolean).join(' ')}`);
  }

  // Organization and title
  if (content.organization) {
    lines.push(`ORG:${content.organization}`);
  }
  if (content.title) {
    lines.push(`TITLE:${content.title}`);
  }

  // Phone
  if (content.phone) {
    lines.push(`TEL;TYPE=CELL:${content.phone}`);
  }

  // Email
  if (content.email) {
    lines.push(`EMAIL:${content.email}`);
  }

  // Website
  if (content.website) {
    lines.push(`URL:${content.website}`);
  }

  // Address
  if (content.address) {
    lines.push(`ADR:;;${content.address};;;;`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
