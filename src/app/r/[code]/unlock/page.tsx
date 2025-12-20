'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UnlockPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        // Redirect to destination
        window.location.href = data.destinationUrl;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <Card className="max-w-md w-full p-8 glass">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <LockIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Password Protected</h1>
          <p className="text-muted-foreground mt-2">
            This QR code is protected. Enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-secondary/50"
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

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Protected by{' '}
            <a href="/" className="text-primary hover:underline">
              QRForge
            </a>
          </p>
        </div>
      </Card>
    </div>
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
