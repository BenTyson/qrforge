'use client';

import Link from 'next/link';
import { QR_TYPE_METADATA } from '@/components/qr/wizard/constants';

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

export function ArticleCTA({
  qrType,
  title,
  description,
  variant = 'inline',
  buttonText,
}: ArticleCTAProps) {
  const config = qrType ? QR_TYPE_METADATA[qrType] : null;

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
      <div className="my-10 relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-cyan-500/30 to-primary/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

        {/* Main card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-cyan-500/10 opacity-60" />

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Icon */}
            <div className="hidden md:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <QRIcon className="w-8 h-8 text-primary" />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {displayTitle}
              </h3>
              <p className="text-slate-400 text-sm md:text-base max-w-md">
                {displayDescription}
              </p>
            </div>

            {/* Button */}
            <Link href={href} onClick={handleClick} className="shrink-0">
              <button className="group/btn relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25">
                {/* Button gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-500" />
                {/* Button shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
                {/* Button content */}
                <span className="relative flex items-center gap-2">
                  {displayButtonText}
                  <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className="my-8 relative group">
      {/* Subtle glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card */}
      <div className="relative rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-5 overflow-hidden backdrop-blur-sm">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300">
            <QRIcon className="w-6 h-6 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors duration-200">
              {displayTitle}
            </h4>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {displayDescription}
            </p>

            {/* Button */}
            <Link href={href} onClick={handleClick}>
              <button className="group/btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all duration-200">
                {displayButtonText}
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function QRIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="3" height="3" rx="0.5" />
      <rect x="18" y="14" width="3" height="3" rx="0.5" />
      <rect x="14" y="18" width="3" height="3" rx="0.5" />
      <rect x="18" y="18" width="3" height="3" rx="0.5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default ArticleCTA;
