'use client';

import { ReactNode } from 'react';

interface LandingCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

/**
 * Refined glass card component for landing pages.
 *
 * Design: Subtle, modern glass morphism without aggressive glows.
 * - Ultra-subtle white background (3% opacity)
 * - Heavy backdrop blur
 * - Subtle white border (6% opacity)
 * - Soft dark shadow only (no colored glow)
 */
export function LandingCard({
  children,
  className = '',
  animate = true
}: LandingCardProps) {
  return (
    <div
      className={`
        bg-white/[0.03]
        backdrop-blur-xl
        rounded-3xl
        border border-white/[0.06]
        shadow-2xl shadow-black/40
        ${animate ? 'animate-fade-in' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface LandingCardContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Content wrapper for LandingCard with standard padding.
 */
export function LandingCardContent({
  children,
  className = ''
}: LandingCardContentProps) {
  return (
    <div className={`p-8 ${className}`}>
      {children}
    </div>
  );
}
