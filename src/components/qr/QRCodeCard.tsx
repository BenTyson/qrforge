'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateQRDataURL, generateQRSVG, downloadQRPNG, downloadQRSVG } from '@/lib/qr/generator';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface QRCodeData {
  id: string;
  name: string;
  type: 'static' | 'dynamic';
  content_type: string;
  content: QRContent;
  short_code: string | null;
  destination_url: string | null;
  style: QRStyleOptions;
  scan_count: number;
  created_at: string;
}

interface QRCodeCardProps {
  qrCode: QRCodeData;
}

export function QRCodeCard({ qrCode }: QRCodeCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [qrDataURL, setQRDataURL] = useState<string | null>(null);

  // Generate QR preview on mount
  useEffect(() => {
    generateQRDataURL(qrCode.content, { ...qrCode.style, width: 128 })
      .then(setQRDataURL)
      .catch(console.error);
  }, [qrCode.content, qrCode.style]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrCode.id);

      if (error) throw error;

      toast.success('QR code deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete QR code');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPNG = async () => {
    try {
      const dataURL = await generateQRDataURL(qrCode.content, { ...qrCode.style, width: 1024 });
      downloadQRPNG(dataURL, qrCode.name || 'qrforge-code');
      toast.success('PNG downloaded');
    } catch (error) {
      toast.error('Failed to download PNG');
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const svg = await generateQRSVG(qrCode.content, qrCode.style);
      downloadQRSVG(svg, qrCode.name || 'qrforge-code');
      toast.success('SVG downloaded');
    } catch (error) {
      toast.error('Failed to download SVG');
    }
  };

  const handleCopyLink = async () => {
    if (!qrCode.short_code) {
      toast.error('No short link available');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const link = `${baseUrl}/r/${qrCode.short_code}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const getContentTypeIcon = () => {
    switch (qrCode.content_type) {
      case 'url': return <LinkIcon className="w-4 h-4" />;
      case 'wifi': return <WifiIcon className="w-4 h-4" />;
      case 'vcard': return <UserIcon className="w-4 h-4" />;
      case 'email': return <MailIcon className="w-4 h-4" />;
      case 'phone': return <PhoneIcon className="w-4 h-4" />;
      case 'sms': return <MessageIcon className="w-4 h-4" />;
      default: return <TextIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card
      className="p-4 glass hover:glow transition-all duration-300 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-4">
        {/* QR Preview */}
        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {qrDataURL ? (
            <img src={qrDataURL} alt={qrCode.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-12 h-12 bg-gray-200 animate-pulse rounded" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{qrCode.name}</h3>
            <div className="flex gap-1 shrink-0">
              {qrCode.type === 'dynamic' && (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  Dynamic
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            {getContentTypeIcon()}
            <span className="capitalize">{qrCode.content_type}</span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ScanIcon className="w-3 h-3" />
              {qrCode.scan_count} scan{qrCode.scan_count !== 1 ? 's' : ''}
            </span>
            <span>{formatDate(qrCode.created_at)}</span>
          </div>

          {/* Actions */}
          <div className={`flex gap-2 mt-3 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <Link href={`/qr-codes/${qrCode.id}`}>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <EditIcon className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleDownloadPNG}>
              <DownloadIcon className="w-3 h-3 mr-1" />
              PNG
            </Button>
            {qrCode.short_code && (
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCopyLink}>
                <CopyIcon className="w-3 h-3 mr-1" />
                Link
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <TrashIcon className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Icons
function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function WifiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
