'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { MultiReviewContent, ReviewPlatformEntry } from '@/lib/qr/types';
import {
  LandingBackground,
  LandingCard,
  LandingCardContent,
  LandingFooter,
  LandingLoader
} from '@/components/landing';

interface PageProps {
  params: Promise<{ code: string }>;
}

const PLATFORM_LABELS: Record<string, string> = {
  google: 'Google Reviews',
  yelp: 'Yelp',
  tripadvisor: 'TripAdvisor',
  facebook: 'Facebook',
};

const PLATFORM_COLORS: Record<string, { bg: string; hover: string; shadow: string }> = {
  google: {
    bg: 'linear-gradient(135deg, #4285F4, #3367D6)',
    hover: 'linear-gradient(135deg, #5294FF, #4285F4)',
    shadow: 'rgba(66, 133, 244, 0.4)',
  },
  yelp: {
    bg: 'linear-gradient(135deg, #FF1A1A, #CC0000)',
    hover: 'linear-gradient(135deg, #FF3333, #FF1A1A)',
    shadow: 'rgba(255, 26, 26, 0.4)',
  },
  tripadvisor: {
    bg: 'linear-gradient(135deg, #00AF87, #008768)',
    hover: 'linear-gradient(135deg, #00C99A, #00AF87)',
    shadow: 'rgba(0, 175, 135, 0.4)',
  },
  facebook: {
    bg: 'linear-gradient(135deg, #1877F2, #0C5DC5)',
    hover: 'linear-gradient(135deg, #2B88FF, #1877F2)',
    shadow: 'rgba(24, 119, 242, 0.4)',
  },
};

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'google':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case 'yelp':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206l2.039 1.635c.633.508.42 1.55-.37 3.076zm-7.842-4.61l.975-5.11c.168-.882 1.307-1.063 1.72-.273l1.785 3.42c.261.5-.003 1.094-.547 1.25l-2.747.786c-.837.24-1.47-.657-1.186-2.073zm-3.2 7.273l-5.08-1.032c-.89-.18-.99-1.345-.15-1.756l3.63-1.78c.496-.243 1.08.032 1.214.57l.68 2.73c.206.825-.711 1.476-2.293 1.268zm.828 1.378l2.542 4.367c.443.762-.24 1.67-1.034 1.37l-3.437-1.303c-.504-.19-.738-.782-.49-1.26l1.256-2.412c.382-.733 1.582-.5 1.163-.762zm-1.024-5.08l-4.56-2.826c-.797-.493-.434-1.682.547-1.795l4.253-.49c.58-.067 1.04.412.972.994l-.33 2.936c-.106.944-1.295 1.382-.882 1.18z" />
        </svg>
      );
    case 'tripadvisor':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12.006 20l1.928-2.387a5.976 5.976 0 0 0 4.075 1.6 5.997 5.997 0 0 0 4.04-10.43L24 6.648h-4.35a13.573 13.573 0 0 0-7.644-2.353zM6.003 17.213a3.997 3.997 0 1 1 0-7.994 3.997 3.997 0 0 1 0 7.994zm11.994 0a3.997 3.997 0 1 1 0-7.994 3.997 3.997 0 0 1 0 7.994zM6.003 11.219a2 2 0 1 0 0 3.998 2 2 0 0 0 0-3.998zm11.994 0a2 2 0 1 0 0 3.998 2 2 0 0 0 0-3.998z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

function getPlatformStyle(platform: string, accentColor: string) {
  if (PLATFORM_COLORS[platform]) {
    return PLATFORM_COLORS[platform];
  }
  // Custom platforms use the accent color
  return {
    bg: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
    hover: `linear-gradient(135deg, ${accentColor}ee, ${accentColor})`,
    shadow: `${accentColor}66`,
  };
}

export default function MultiReviewLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<MultiReviewContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', 'multi-review')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setContent(qrCode.content as MultiReviewContent);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  if (loading) {
    return <LandingLoader />;
  }

  if (!content) {
    notFound();
  }

  const accentColor = content.accentColor || '#f59e0b';
  // Only show platforms that have a URL
  const activePlatforms = content.platforms.filter(p => p.url?.trim());

  return (
    <LandingBackground accentColor={accentColor} className="py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <LandingCard>
          <LandingCardContent>
            {/* Business Logo / Initial */}
            <div
              className="text-center mb-6 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                }}
              >
                {content.businessName.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold text-white">{content.businessName}</h1>
            </div>

            {/* Stars Display */}
            <div
              className="flex justify-center gap-1 mb-6 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="#FBBC05"
                  style={{
                    filter: `drop-shadow(0 0 6px #FBBC0550)`,
                    animation: `star-pulse 2s ease-in-out infinite`,
                    animationDelay: `${star * 100}ms`,
                  }}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            {/* Message */}
            <div
              className="text-center mb-6 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <p className="text-lg text-white/90 font-medium mb-1">
                Leave us a review
              </p>
              <p className="text-zinc-400 text-sm">
                Choose your preferred platform below
              </p>
            </div>

            {/* Platform Buttons */}
            <div className="space-y-3">
              {activePlatforms.map((entry: ReviewPlatformEntry, index: number) => {
                const style = getPlatformStyle(entry.platform, accentColor);
                const label = entry.platform === 'custom'
                  ? (entry.label || 'Leave a Review')
                  : `Review on ${PLATFORM_LABELS[entry.platform] || entry.platform}`;

                return (
                  <a
                    key={index}
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
                    style={{
                      animationDelay: `${400 + index * 100}ms`,
                      background: style.bg,
                      boxShadow: `0 8px 24px ${style.shadow}`,
                    }}
                  >
                    <span className="flex items-center justify-center gap-3">
                      <PlatformIcon platform={entry.platform} />
                      {label}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Secondary Info */}
            <p
              className="text-center text-xs text-zinc-500 mt-6 animate-slide-up"
              style={{ animationDelay: `${400 + activePlatforms.length * 100 + 100}ms` }}
            >
              You&apos;ll be redirected to your chosen platform
            </p>
          </LandingCardContent>
        </LandingCard>

        <LandingFooter accentColor={accentColor} delay={400 + activePlatforms.length * 100 + 200} />
      </div>

      {/* Star pulse animation */}
      <style jsx>{`
        @keyframes star-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </LandingBackground>
  );
}
