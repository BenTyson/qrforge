'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface PublicNavProps {
  showAuthButtons?: boolean;
}

export function PublicNav({ showAuthButtons = true }: PublicNavProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/QRWolf_Logo_Icon.png"
              alt="QRWolf"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold gradient-text">QRWolf</span>
          </Link>
          {showAuthButtons && (
            <div className="hidden md:flex items-center gap-6">
              <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              {!isLoading && (
                isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button size="sm" className="glow-hover">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="border-primary/50">Sign In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="glow-hover">Get Started</Button>
                    </Link>
                  </>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
