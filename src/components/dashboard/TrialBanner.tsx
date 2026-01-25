'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const isUrgent = daysRemaining <= 3;

  return (
    <div className={`rounded-2xl border p-4 mb-6 ${
      isUrgent
        ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent'
        : 'border-primary/30 bg-gradient-to-r from-primary/10 via-cyan-500/5 to-transparent'
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isUrgent ? 'bg-amber-500/20' : 'bg-primary/20'
          }`}>
            {isUrgent ? (
              <ClockIcon className="w-5 h-5 text-amber-500" />
            ) : (
              <SparkleIcon className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold">
              {isUrgent ? (
                <span className="text-amber-400">
                  {daysRemaining === 1 ? '1 day' : `${daysRemaining} days`} left in your Pro trial
                </span>
              ) : (
                <span>
                  Pro Trial - {daysRemaining} days remaining
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {isUrgent
                ? 'Upgrade now to keep your Pro features'
                : 'Enjoy full access to dynamic QR codes and analytics'}
            </p>
          </div>
        </div>
        <Link href="/settings">
          <Button
            size="sm"
            className={isUrgent ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    </div>
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

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

export default TrialBanner;
