'use client';

import Link from 'next/link';

interface LandingFooterProps {
  accentColor?: string;
  delay?: number;
}

/**
 * Consistent footer component for landing pages.
 */
export function LandingFooter({
  accentColor = '#14b8a6',
  delay = 400
}: LandingFooterProps) {
  return (
    <p
      className="mt-10 text-center text-sm text-zinc-500 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      Powered by{' '}
      <Link
        href="/"
        className="font-medium transition-colors hover:opacity-80"
        style={{ color: accentColor }}
      >
        QRWolf
      </Link>
    </p>
  );
}
