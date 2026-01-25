'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LandingBackground,
  LandingCard,
  LandingCardContent,
  LandingFooter
} from '@/components/landing';

export default function UnlockPage() {
  const params = useParams();
  const code = params.code as string;

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const accentColor = '#14b8a6';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/qr/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to landing page or destination
        if (data.hasLandingPage && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          window.location.href = data.destinationUrl;
        }
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LandingBackground accentColor={accentColor} className="flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <LandingCard>
          <LandingCardContent>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <LockIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white">Password Protected</h1>
              <p className="text-zinc-400 mt-2">
                This QR code is protected. Enter the password to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-zinc-900/50 border-zinc-700"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!password || isLoading}>
                {isLoading ? 'Verifying...' : 'Unlock'}
              </Button>
            </form>
          </LandingCardContent>
        </LandingCard>

        <LandingFooter accentColor={accentColor} />
      </div>
    </LandingBackground>
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
