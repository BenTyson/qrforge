'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

function CheckoutHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  const plan = searchParams.get('plan') as 'pro' | 'business' | null;
  const interval = (searchParams.get('interval') as 'monthly' | 'yearly') || 'monthly';

  useEffect(() => {
    if (!plan || !['pro', 'business'].includes(plan)) {
      setError('Invalid plan selected');
      setProcessing(false);
      return;
    }

    const initiateCheckout = async () => {
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, interval }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If unauthorized, redirect to login with return URL (URL-encoded)
          if (response.status === 401) {
            const returnUrl = encodeURIComponent(`/checkout?plan=${plan}&interval=${interval}`);
            router.push(`/login?redirect=${returnUrl}`);
            return;
          }
          throw new Error(data.error || 'Failed to create checkout session');
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setProcessing(false);
      }
    };

    initiateCheckout();
  }, [plan, interval, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 glass text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Image
            src="/QRWolf_Logo_Icon.png"
            alt="QRWolf"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold gradient-text">QRWolf</span>
        </Link>

        {processing && !error ? (
          <>
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Redirecting to checkout...</h1>
            <p className="text-muted-foreground text-sm">
              Setting up your {plan === 'pro' ? 'Pro' : 'Business'} subscription ({interval})
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold mb-2">Checkout Error</h1>
            <p className="text-muted-foreground text-sm mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/#pricing"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                View Plans
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutHandler />
    </Suspense>
  );
}
