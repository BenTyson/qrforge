'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeCard } from './QRCodeCard';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';
import type { SubscriptionTier } from '@/lib/supabase/types';

interface QRCodeInBatch {
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

interface BulkBatchCardProps {
  batch: {
    id: string;
    codes: QRCodeInBatch[];
    createdAt: string;
    totalScans: number;
  };
  index?: number;
  userTier?: SubscriptionTier;
}

export function BulkBatchCard({ batch, index = 0, userTier = 'free' }: BulkBatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const createdDate = new Date(batch.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden hover:border-primary/30 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden z-10">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Batch Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors relative z-20"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-amber-500/10 transition-shadow">
            <BulkIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-left">
            <p className="font-medium">
              Bulk Batch
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                {createdDate}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {batch.codes.length} QR codes • {batch.totalScans.toLocaleString()} scans
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/analytics?batch=${batch.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            Analytics
          </Link>
          <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full border border-amber-500/20">
            {batch.codes.length} codes
          </span>
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {batch.codes.map((qr, codeIndex) => (
              <QRCodeCard key={qr.id} qrCode={qr} index={codeIndex} compact userTier={userTier} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BulkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
