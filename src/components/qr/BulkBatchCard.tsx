'use client';

import { useState } from 'react';
import { QRCodeCard } from './QRCodeCard';

interface BulkBatchCardProps {
  batch: {
    id: string;
    codes: any[];
    createdAt: string;
    totalScans: number;
  };
}

export function BulkBatchCard({ batch }: BulkBatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const createdDate = new Date(batch.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      {/* Batch Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
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
          <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">
            {batch.codes.length} codes
          </span>
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
        <div className="px-4 pb-4 pt-2 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {batch.codes.map((qr, index) => (
              <QRCodeCard key={qr.id} qrCode={qr} index={index} compact />
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
