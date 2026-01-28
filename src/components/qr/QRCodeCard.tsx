'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateQRDataURL, downloadQRPNG, generateQRSVG, downloadQRSVG } from '@/lib/qr/generator';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import type { Folder, SubscriptionTier } from '@/lib/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { getAppUrl } from '@/lib/utils';

interface QRCodeData {
  id: string;
  name: string;
  type: 'static' | 'dynamic';
  content_type: string;
  content: QRContent | Record<string, unknown>;
  short_code: string | null;
  destination_url: string | null;
  style: QRStyleOptions | Record<string, unknown>;
  scan_count: number;
  created_at: string;
  expires_at: string | null;
  active_from: string | null;
  active_until: string | null;
  password_hash: string | null;
  folder_id?: string | null;
}

interface QRCodeCardProps {
  qrCode: QRCodeData;
  index?: number;
  compact?: boolean;
  folderColor?: string | null;
  folders?: Folder[];
  onFolderChange?: (qrCodeId: string, folderId: string | null) => void;
  userTier?: SubscriptionTier;
}

export function QRCodeCard({ qrCode, index = 0, compact: _compact = false, folderColor, folders = [], onFolderChange, userTier = 'free' }: QRCodeCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [qrDataURL, setQRDataURL] = useState<string | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [largeQRDataURL, setLargeQRDataURL] = useState<string | null>(null);

  // Check if user can download SVG (Pro or Business tier)
  const canDownloadSVG = userTier === 'pro' || userTier === 'business';

  // Generate QR preview on mount
  // IMPORTANT: If the QR has a short_code, generate the QR with the redirect URL
  // This ensures the preview matches what gets scanned (trackable URL)
  useEffect(() => {
    let qrContent: QRContent = qrCode.content as QRContent;

    // Use redirect URL for any QR with a short_code (dynamic or static)
    // This ensures scans are tracked and the QR actually works
    if (qrCode.short_code) {
      qrContent = { type: 'url', url: `${getAppUrl()}/r/${qrCode.short_code}` };
    }

    generateQRDataURL(qrContent, { ...(qrCode.style as QRStyleOptions), width: 128 })
      .then(setQRDataURL)
      .catch(console.error);
  }, [qrCode.content, qrCode.style, qrCode.short_code]);

  // Generate large QR when quick view opens
  useEffect(() => {
    if (!showQuickView) return;

    let qrContent: QRContent = qrCode.content as QRContent;
    if (qrCode.short_code) {
      qrContent = { type: 'url', url: `${getAppUrl()}/r/${qrCode.short_code}` };
    }

    generateQRDataURL(qrContent, { ...(qrCode.style as QRStyleOptions), width: 300 })
      .then(setLargeQRDataURL)
      .catch(console.error);
  }, [showQuickView, qrCode.content, qrCode.style, qrCode.short_code]);

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
      // IMPORTANT: If QR has a short_code, always use the redirect URL
      // This ensures scans are tracked regardless of how the QR was originally saved
      let qrContent: QRContent = qrCode.content as QRContent;
      if (qrCode.short_code) {
        qrContent = { type: 'url', url: `${getAppUrl()}/r/${qrCode.short_code}` };
      }

      const dataURL = await generateQRDataURL(qrContent, { ...(qrCode.style as QRStyleOptions), width: 1024 });
      await downloadQRPNG(dataURL, `qrwolf-${(qrCode.name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
      toast.success('PNG downloaded');
    } catch {
      toast.error('Failed to download PNG');
    }
  };

  const handleDownloadSVG = async () => {
    if (!canDownloadSVG) return;

    try {
      let qrContent: QRContent = qrCode.content as QRContent;
      if (qrCode.short_code) {
        qrContent = { type: 'url', url: `${getAppUrl()}/r/${qrCode.short_code}` };
      }

      const svg = await generateQRSVG(qrContent, { ...(qrCode.style as QRStyleOptions), width: 1024 });
      downloadQRSVG(svg, `qrwolf-${(qrCode.name || 'code').toLowerCase().replace(/\s+/g, '-')}`);
      toast.success('SVG downloaded');
    } catch {
      toast.error('Failed to download SVG');
    }
  };

  const handleCopyLink = async () => {
    if (!qrCode.short_code) {
      toast.error('No short link available');
      return;
    }

    const link = `${getAppUrl()}/r/${qrCode.short_code}`;

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
      case 'whatsapp': return <WhatsAppIcon className="w-4 h-4" />;
      case 'facebook': return <FacebookIcon className="w-4 h-4" />;
      case 'instagram': return <InstagramIcon className="w-4 h-4" />;
      case 'apps': return <AppsIcon className="w-4 h-4" />;
      case 'pdf': return <PDFIcon className="w-4 h-4" />;
      case 'images': return <ImagesIcon className="w-4 h-4" />;
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'mp3': return <MusicIcon className="w-4 h-4" />;
      case 'menu': return <MenuIcon className="w-4 h-4" />;
      case 'business': return <BusinessIcon className="w-4 h-4" />;
      case 'links': return <LinksIcon className="w-4 h-4" />;
      case 'coupon': return <CouponIcon className="w-4 h-4" />;
      case 'social': return <SocialIcon className="w-4 h-4" />;
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
      case 'whatsapp': return 'emerald';
      case 'facebook': return 'blue';
      case 'instagram': return 'pink';
      case 'apps': return 'indigo';
      case 'pdf': return 'red';
      case 'images': return 'teal';
      case 'video': return 'red';
      case 'mp3': return 'purple';
      case 'menu': return 'orange';
      case 'business': return 'slate';
      case 'links': return 'primary';
      case 'coupon': return 'amber';
      case 'social': return 'cyan';
      default: return 'primary';
    }
  };

  const accent = getAccentColor();

  // Get gradient classes for accent
  const getAccentGradient = () => {
    switch (accent) {
      case 'blue': return 'from-blue-500 to-cyan-500';
      case 'emerald': return 'from-emerald-500 to-teal-500';
      case 'violet': return 'from-violet-500 to-purple-500';
      case 'amber': return 'from-amber-500 to-orange-500';
      case 'rose': return 'from-rose-500 to-pink-500';
      case 'cyan': return 'from-cyan-500 to-blue-500';
      case 'pink': return 'from-pink-500 to-rose-500';
      case 'indigo': return 'from-indigo-500 to-blue-500';
      case 'red': return 'from-red-500 to-rose-500';
      case 'teal': return 'from-teal-500 to-cyan-500';
      case 'purple': return 'from-purple-500 to-violet-500';
      case 'orange': return 'from-orange-500 to-amber-500';
      case 'slate': return 'from-slate-500 to-gray-500';
      default: return 'from-primary to-cyan-500';
    }
  };

  const getAccentBg = () => {
    switch (accent) {
      case 'blue': return 'bg-blue-500/10 text-blue-500';
      case 'emerald': return 'bg-emerald-500/10 text-emerald-500';
      case 'violet': return 'bg-violet-500/10 text-violet-500';
      case 'amber': return 'bg-amber-500/10 text-amber-600';
      case 'rose': return 'bg-rose-500/10 text-rose-500';
      case 'cyan': return 'bg-cyan-500/10 text-cyan-500';
      case 'pink': return 'bg-pink-500/10 text-pink-500';
      case 'indigo': return 'bg-indigo-500/10 text-indigo-500';
      case 'red': return 'bg-red-500/10 text-red-500';
      case 'teal': return 'bg-teal-500/10 text-teal-500';
      case 'purple': return 'bg-purple-500/10 text-purple-500';
      case 'orange': return 'bg-orange-500/10 text-orange-500';
      case 'slate': return 'bg-slate-500/10 text-slate-400';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div
      className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden z-10">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Folder indicator */}
      {folderColor && (
        <div
          className="absolute top-0 right-0 w-3 h-3 rounded-bl-lg"
          style={{ backgroundColor: folderColor }}
          title="In folder"
        />
      )}

      {/* Top accent bar */}
      <div className={`h-1 bg-gradient-to-r ${getAccentGradient()}`} />

      <div className="p-4">
        <div className="flex gap-4">
          {/* QR Preview - Clickable for Quick View */}
          <button
            onClick={() => setShowQuickView(true)}
            className="relative w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 hover:shadow-md transition-all group/qr"
            aria-label="View larger QR code"
          >
            {qrDataURL ? (
              <Image src={qrDataURL} alt={qrCode.name} width={80} height={80} className="w-full h-full object-contain p-1" unoptimized />
            ) : (
              <div className="w-10 h-10 bg-gray-100 animate-pulse rounded" />
            )}
            {/* Scan count overlay */}
            {qrCode.scan_count > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {qrCode.scan_count > 999 ? '999+' : qrCode.scan_count}
              </div>
            )}
            {/* Zoom hint on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <ZoomIcon className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold truncate text-sm">{qrCode.name}</h3>
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getAccentBg()}`}>
                {getContentTypeIcon()}
                <span className="capitalize">{qrCode.content_type}</span>
              </span>
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
          <Link href={`/qr-codes/${qrCode.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className={`w-full h-8 text-xs${userTier === 'free' ? ' opacity-60' : ''}`}>
              <EditIcon className="w-3 h-3 mr-1.5" aria-hidden="true" />
              Edit
              {userTier === 'free' && (
                <span className="ml-1 text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Pro</span>
              )}
            </Button>
          </Link>
          <Link href={`/analytics?qr=${qrCode.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              title="View analytics"
              aria-label="View analytics for this QR code"
            >
              <AnalyticsIcon className="w-3 h-3" aria-hidden="true" />
            </Button>
          </Link>
          <Link href={`/analytics?qr=${qrCode.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              title="View analytics"
              aria-label="View analytics for this QR code"
            >
              <AnalyticsIcon className="w-3 h-3" aria-hidden="true" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-2"
            onClick={handleDownloadPNG}
            title="Download PNG"
            aria-label="Download as PNG"
          >
            <DownloadIcon className="w-3 h-3 mr-1" aria-hidden="true" />
            <span className="text-[10px] font-medium">PNG</span>
          </Button>
          {canDownloadSVG ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={handleDownloadSVG}
              title="Download SVG"
              aria-label="Download as SVG"
            >
              <DownloadIcon className="w-3 h-3 mr-1" aria-hidden="true" />
              <span className="text-[10px] font-medium">SVG</span>
            </Button>
          ) : (
            <Link href="/plans">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2 opacity-60"
                title="SVG download - Pro feature"
                aria-label="Upgrade to Pro for SVG download"
              >
                <DownloadIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                <span className="text-[10px] font-medium">SVG</span>
                <span className="ml-1 text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Pro</span>
              </Button>
            </Link>
          )}
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
          {folders.length > 0 && onFolderChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3"
                  aria-label="Move to folder"
                >
                  <FolderIcon className="w-3 h-3" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                <DropdownMenuItem
                  onClick={() => onFolderChange(qrCode.id, null)}
                  className={!qrCode.folder_id ? 'bg-primary/10 text-primary' : ''}
                >
                  No Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => onFolderChange(qrCode.id, folder.id)}
                    className={qrCode.folder_id === folder.id ? 'bg-primary/10 text-primary' : ''}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: folder.color }}
                    />
                    {folder.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="truncate">{qrCode.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {largeQRDataURL ? (
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <Image
                  src={largeQRDataURL}
                  alt={qrCode.name}
                  width={300}
                  height={300}
                  className="w-[300px] h-[300px] object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-[300px] h-[300px] bg-gray-100 animate-pulse rounded-xl" />
            )}
          </div>
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button onClick={handleDownloadPNG} className="gap-2">
              <DownloadIcon className="w-4 h-4" />
              Download PNG
            </Button>
            {canDownloadSVG ? (
              <Button onClick={handleDownloadSVG} variant="outline" className="gap-2">
                <DownloadIcon className="w-4 h-4" />
                Download SVG
              </Button>
            ) : (
              <Link href="/plans">
                <Button variant="outline" className="gap-2">
                  <DownloadIcon className="w-4 h-4" />
                  Download SVG
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Pro</span>
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

// Additional icons for new QR types
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function AppsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function PDFIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ImagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function BusinessIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function LinksIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function CouponIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function SocialIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
