'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
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
  expires_at: string | null;
  active_from: string | null;
  active_until: string | null;
  password_hash: string | null;
}

interface QRCodeCardProps {
  qrCode: QRCodeData;
  index?: number;
  compact?: boolean;
}

export function QRCodeCard({ qrCode, index = 0, compact = false }: QRCodeCardProps) {
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
      downloadQRPNG(dataURL, `qrwolf-${(qrCode.name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
      toast.success('PNG downloaded');
    } catch (error) {
      toast.error('Failed to download PNG');
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const svg = await generateQRSVG(qrCode.content, qrCode.style);
      downloadQRSVG(svg, `qrwolf-${(qrCode.name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
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

  const formatExpirationDate = (date: string) => {
    const expDate = new Date(date);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays <= 7) return `in ${diffDays}d`;
    return expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Determine scheduled activation status
  const getScheduledStatus = () => {
    const now = new Date();

    if (qrCode.active_from) {
      const from = new Date(qrCode.active_from);
      if (now < from) {
        return { status: 'pending', label: `Starts ${formatExpirationDate(qrCode.active_from)}` };
      }
    }

    if (qrCode.active_until) {
      const until = new Date(qrCode.active_until);
      if (now > until) {
        return { status: 'ended', label: 'Schedule ended' };
      }
      return { status: 'active', label: `Until ${formatExpirationDate(qrCode.active_until)}` };
    }

    if (qrCode.active_from) {
      return { status: 'active', label: 'Active (scheduled)' };
    }

    return null;
  };

  const scheduledStatus = getScheduledStatus();

  // Color accents based on content type
  const getAccentColor = () => {
    switch (qrCode.content_type) {
      case 'url': return 'blue';
      case 'wifi': return 'emerald';
      case 'vcard': return 'violet';
      case 'email': return 'amber';
      case 'phone': return 'rose';
      case 'sms': return 'cyan';
      default: return 'primary';
    }
  };

  const accent = getAccentColor();

  return (
    <div
      className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Top accent bar */}
      <div className={`h-1 bg-gradient-to-r ${
        accent === 'blue' ? 'from-blue-500 to-cyan-500' :
        accent === 'emerald' ? 'from-emerald-500 to-teal-500' :
        accent === 'violet' ? 'from-violet-500 to-purple-500' :
        accent === 'amber' ? 'from-amber-500 to-orange-500' :
        accent === 'rose' ? 'from-rose-500 to-pink-500' :
        accent === 'cyan' ? 'from-cyan-500 to-blue-500' :
        'from-primary to-cyan-500'
      }`} />

      <div className="p-4">
        <div className="flex gap-4">
          {/* QR Preview */}
          <div className="relative w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {qrDataURL ? (
              <img src={qrDataURL} alt={qrCode.name} className="w-full h-full object-contain p-1" />
            ) : (
              <div className="w-10 h-10 bg-gray-100 animate-pulse rounded" />
            )}
            {/* Scan count overlay */}
            {qrCode.scan_count > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {qrCode.scan_count > 999 ? '999+' : qrCode.scan_count}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold truncate text-sm">{qrCode.name}</h3>
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                accent === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                accent === 'violet' ? 'bg-violet-500/10 text-violet-500' :
                accent === 'amber' ? 'bg-amber-500/10 text-amber-600' :
                accent === 'rose' ? 'bg-rose-500/10 text-rose-500' :
                accent === 'cyan' ? 'bg-cyan-500/10 text-cyan-500' :
                'bg-primary/10 text-primary'
              }`}>
                {getContentTypeIcon()}
                <span className="capitalize">{qrCode.content_type}</span>
              </span>
              {qrCode.type === 'dynamic' && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  Dynamic
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-muted-foreground">
              {/* Password protected indicator */}
              {qrCode.password_hash && (
                <span className="inline-flex items-center gap-0.5 text-violet-500">
                  <LockIcon className="w-3 h-3" />
                  Protected
                </span>
              )}
              {/* Scheduled activation indicator */}
              {scheduledStatus && (
                <span className={`inline-flex items-center gap-0.5 ${
                  scheduledStatus.status === 'pending' ? 'text-blue-500' :
                  scheduledStatus.status === 'ended' ? 'text-red-500' :
                  'text-emerald-500'
                }`}>
                  <ClockIcon className="w-3 h-3" />
                  {scheduledStatus.label}
                </span>
              )}
              {/* Expiration indicator */}
              {qrCode.expires_at && (
                new Date(qrCode.expires_at) < new Date() ? (
                  <span className="text-red-500 font-medium">Expired</span>
                ) : (
                  <span className="text-amber-500">Expires {formatExpirationDate(qrCode.expires_at)}</span>
                )
              )}
              <span>{formatDate(qrCode.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions - Always visible on mobile, hover on desktop */}
        <div
          className={`flex gap-2 mt-3 pt-3 border-t border-border/30 transition-all duration-200 ${showActions ? 'opacity-100' : 'sm:opacity-0'}`}
          role="group"
          aria-label="QR code actions"
        >
          <Link href={`/qr-codes/${qrCode.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
              <EditIcon className="w-3 h-3 mr-1.5" aria-hidden="true" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-3"
            onClick={handleDownloadPNG}
            aria-label="Download as PNG"
          >
            <DownloadIcon className="w-3 h-3" aria-hidden="true" />
          </Button>
          {qrCode.short_code && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3"
              onClick={handleCopyLink}
              aria-label="Copy short link"
            >
              <CopyIcon className="w-3 h-3" aria-hidden="true" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500/30"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Delete QR code"
          >
            <TrashIcon className="w-3 h-3" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
