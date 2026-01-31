'use client';

import type { GoogleReviewContent } from '@/lib/qr/types';

interface GoogleReviewPreviewProps {
  content: Partial<GoogleReviewContent>;
  className?: string;
}

export function GoogleReviewPreview({ content, className }: GoogleReviewPreviewProps) {
  const accentColor = content.accentColor || '#4285F4';
  const businessName = content.businessName || 'Business Name';

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
              className="w-16 h-16 rounded-xl flex items-center justify-center mt-6 mb-3 text-white font-bold text-2xl"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              }}
            >
              {businessName.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-sm font-semibold text-white mb-2">{businessName}</h2>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="#FBBC05"
                  stroke="#FBBC05"
                  strokeWidth="1"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            {/* Message Card */}
            <div
              className="w-full bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-5 text-center"
              style={{ boxShadow: `0 8px 32px ${accentColor}15` }}
            >
              <p className="text-xs text-slate-300 mb-1">We&apos;d love your feedback!</p>
              <p className="text-[10px] text-slate-500">
                Tap below to share your experience
              </p>
            </div>

            {/* CTA Button */}
            <button
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                boxShadow: `0 4px 14px ${accentColor}40`,
              }}
            >
              Leave a Google Review
            </button>

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
