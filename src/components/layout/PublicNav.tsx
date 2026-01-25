'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface PublicNavProps {
  showAuthButtons?: boolean;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Templates', href: '/templates' },
  { label: 'Tools', href: '/tools' },
  { label: 'Learn', href: '/learn' },
];

export function PublicNav({ showAuthButtons = true }: PublicNavProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/QRWolf_Logo_Color.png"
                alt="QRWolf"
                width={32}
                height={36}
              />
              <span className="text-xl font-bold text-white">QRWolf</span>
            </Link>

            {/* Desktop Nav */}
            {showAuthButtons && (
              <div className="hidden md:flex items-center gap-6">
                {NAV_LINKS.map((link) => (
                  link.href.startsWith('#') ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
                {!isLoading && (
                  isLoggedIn ? (
                    <Link href="/qr-codes">
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

            {/* Mobile Menu Button */}
            {showAuthButtons && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 bg-background border-b border-border md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {/* Nav Links */}
          {NAV_LINKS.map((link) => (
            link.href.startsWith('#') ? (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block py-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}

          {/* Divider */}
          <div className="border-t border-border pt-4" />

          {/* Auth Buttons */}
          {!isLoading && (
            isLoggedIn ? (
              <Link href="/qr-codes" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full glow-hover">Dashboard</Button>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full glow-hover">Get Started Free</Button>
                </Link>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary/50">Sign In</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
