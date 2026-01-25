'use client';

import { ReactNode } from 'react';

interface LandingBackgroundProps {
  accentColor?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modern, minimalist background component for landing pages.
 *
 * Design: Deep, confident minimalism inspired by Apple/Notion/Airbnb.
 * - Warm black base (zinc-950)
 * - Single subtle radial gradient accent at top
 * - Optional CSS grain texture
 * - Proper z-index layering
 */
export function LandingBackground({
  accentColor = '#14b8a6',
  children,
  className = ''
}: LandingBackgroundProps) {
  return (
    <div
      className={`min-h-screen relative overflow-hidden ${className}`}
      style={{
        backgroundColor: '#09090b', // zinc-950 warm black
      }}
    >
      {/* Subtle accent glow at top - 5% opacity for deep minimalism */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${accentColor}0d 0%, transparent 70%)`,
        }}
      />

      {/* Subtle grain texture via CSS noise */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
