'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: PageProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<{
    team_name: string;
    role: string;
    email: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { token: t } = await params;
      setToken(t);

      const supabase = createClient();

      // Check if user is logged in
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ? { email: u.email || '' } : null);

      // Fetch invite details
      const { data, error } = await supabase
        .from('team_invites')
        .select(`
          email,
          role,
          expires_at,
          accepted_at,
          team:teams (
            name
          )
        `)
        .eq('token', t)
        .single();

      if (error || !data) {
        setError('Invite not found or invalid');
        setIsLoading(false);
        return;
      }

      if (data.accepted_at) {
        setError('This invite has already been accepted');
        setIsLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invite has expired');
        setIsLoading(false);
        return;
      }

      setInvite({
        team_name: (data.team as unknown as { name: string } | null)?.name || 'Unknown Team',
        role: data.role,
        email: data.email,
      });
      setIsLoading(false);
    };

    init();
  }, [params]);

  const handleAccept = async () => {
    if (!token) return;

    setIsAccepting(true);
    setError(null);

    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to accept invite');
      }

      router.push('/settings?tab=team');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
        <Card className="max-w-md w-full p-8 glass text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <XIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invalid Invite</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <Card className="max-w-md w-full p-8 glass text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <TeamIcon className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Team Invitation</h1>
        <p className="text-muted-foreground mb-6">
          You&apos;ve been invited to join{' '}
          <span className="font-medium text-foreground">{invite?.team_name}</span>{' '}
          as a{' '}
          <span className="font-medium text-foreground">{invite?.role}</span>.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {user ? (
          user.email === invite?.email ? (
            <Button
              onClick={handleAccept}
              disabled={isAccepting}
              className="w-full"
              size="lg"
            >
              {isAccepting ? 'Accepting...' : 'Accept Invitation'}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-amber-500">
                This invite was sent to <strong>{invite?.email}</strong>.
                You&apos;re logged in as <strong>{user.email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Please log in with the correct account or ask for a new invite.
              </p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please log in to accept this invitation.
            </p>
            <Link href={`/login?redirect=/invite/${token}`}>
              <Button className="w-full" size="lg">
                Log In to Accept
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href={`/signup?redirect=/invite/${token}`} className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function TeamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
