'use client';

import type { MultiReviewContent } from '@/lib/qr/types';

interface MultiReviewPreviewProps {
  content: Partial<MultiReviewContent>;
  className?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  google: '#4285F4',
  yelp: '#FF1A1A',
  tripadvisor: '#00AF87',
  facebook: '#1877F2',
};

const PLATFORM_LABELS: Record<string, string> = {
  google: 'Google',
  yelp: 'Yelp',
  tripadvisor: 'TripAdvisor',
  facebook: 'Facebook',
};

function PlatformIcon({ platform, size = 'w-3.5 h-3.5' }: { platform: string; size?: string }) {
  switch (platform) {
    case 'google':
      return (
        <svg className={size} viewBox="0 0 24 24">
          <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case 'yelp':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="#fff">
          <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206l2.039 1.635c.633.508.42 1.55-.37 3.076zm-7.842-4.61l.975-5.11c.168-.882 1.307-1.063 1.72-.273l1.785 3.42c.261.5-.003 1.094-.547 1.25l-2.747.786c-.837.24-1.47-.657-1.186-2.073zm-3.2 7.273l-5.08-1.032c-.89-.18-.99-1.345-.15-1.756l3.63-1.78c.496-.243 1.08.032 1.214.57l.68 2.73c.206.825-.711 1.476-2.293 1.268zm.828 1.378l2.542 4.367c.443.762-.24 1.67-1.034 1.37l-3.437-1.303c-.504-.19-.738-.782-.49-1.26l1.256-2.412c.382-.733 1.582-.5 1.163-.762zm-1.024-5.08l-4.56-2.826c-.797-.493-.434-1.682.547-1.795l4.253-.49c.58-.067 1.04.412.972.994l-.33 2.936c-.106.944-1.295 1.382-.882 1.18z" />
        </svg>
      );
    case 'tripadvisor':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="#fff">
          <path d="M12.006 4.295c-2.67 0-5.338.784-7.645 2.353H0l1.963 2.135a5.997 5.997 0 0 0 4.04 10.43 5.976 5.976 0 0 0 4.075-1.6L12.006 20l1.928-2.387a5.976 5.976 0 0 0 4.075 1.6 5.997 5.997 0 0 0 4.04-10.43L24 6.648h-4.35a13.573 13.573 0 0 0-7.644-2.353zM6.003 17.213a3.997 3.997 0 1 1 0-7.994 3.997 3.997 0 0 1 0 7.994zm11.994 0a3.997 3.997 0 1 1 0-7.994 3.997 3.997 0 0 1 0 7.994zM6.003 11.219a2 2 0 1 0 0 3.998 2 2 0 0 0 0-3.998zm11.994 0a2 2 0 1 0 0 3.998 2 2 0 0 0 0-3.998z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={size} viewBox="0 0 24 24" fill="#fff">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    default:
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

export function MultiReviewPreview({ content, className }: MultiReviewPreviewProps) {
  const accentColor = content.accentColor || '#f59e0b';
  const businessName = content.businessName || 'Business Name';
  const platforms = (content.platforms || []).filter(p => p.url?.trim());

  return (
    <div className={className}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[2rem] p-2 shadow-2xl">
        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[1.5rem] overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor}15 0%, #0f172a 50%, ${accentColor}10 100%)`,
          }}
        >
          {/* Floating decorations */}
          <div
            className="absolute top-10 right-8 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="absolute bottom-20 left-4 w-24 h-24 rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: accentColor }}
          />

          {/* Content */}
          <div className="relative h-full px-4 py-6 flex flex-col items-center overflow-y-auto">
            {/* Business Avatar */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mt-4 mb-2 text-white font-bold text-xl"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              }}
            >
              {businessName.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-sm font-semibold text-white mb-2">{businessName}</h2>

            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="#FBBC05"
                  stroke="#FBBC05"
                  strokeWidth="1"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            {/* Message */}
            <p className="text-[11px] text-slate-300 mb-1">Leave us a review</p>
            <p className="text-[10px] text-slate-500 mb-4">
              Choose your preferred platform
            </p>

            {/* Platform Buttons */}
            <div className="w-full space-y-2">
              {platforms.length > 0 ? (
                platforms.map((entry, index) => {
                  const color = PLATFORM_COLORS[entry.platform] || accentColor;
                  const label = entry.platform === 'custom'
                    ? (entry.label || 'Custom')
                    : (PLATFORM_LABELS[entry.platform] || entry.platform);

                  return (
                    <div
                      key={index}
                      className="w-full py-2.5 rounded-lg text-[11px] font-semibold text-white flex items-center justify-center gap-1.5"
                      style={{
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        boxShadow: `0 4px 12px ${color}40`,
                      }}
                    >
                      <PlatformIcon platform={entry.platform} />
                      Review on {label}
                    </div>
                  );
                })
              ) : (
                <div className="w-full py-6 rounded-xl border border-dashed border-white/10 flex flex-col items-center gap-1">
                  <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <p className="text-[10px] text-slate-500">Add review platforms</p>
                </div>
              )}
            </div>

            {/* Powered by */}
            <p className="mt-auto pt-4 text-[10px] text-slate-500">
              Powered by QRWolf
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
