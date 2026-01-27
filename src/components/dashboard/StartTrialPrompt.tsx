'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function StartTrialPrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create Stripe checkout session for Pro plan with trial
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro',
          interval: 'monthly',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start checkout');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-cyan-500/10 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <GiftIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Try Pro free for 7 days</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock dynamic QR codes, advanced analytics, custom branding, and 10,000 monthly scans. Cancel anytime before trial ends.
          </p>
        </div>
        <Button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="shrink-0 gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-4 h-4" />
              Loading...
            </>
          ) : (
            <>
              <SparkleIcon className="w-4 h-4" />
              Start Free Trial
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-3">{error}</p>
      )}
    </div>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
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

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
