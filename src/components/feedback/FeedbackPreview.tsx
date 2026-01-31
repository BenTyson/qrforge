'use client';

import type { FeedbackContent } from '@/lib/qr/types';

interface FeedbackPreviewProps {
  content: Partial<FeedbackContent>;
}

export function FeedbackPreview({ content }: FeedbackPreviewProps) {
  const accentColor = content.accentColor || '#f59e0b';
  const businessName = content.businessName || 'Business Name';
  const formTitle = content.formTitle || 'How was your experience?';
  const ratingType = content.ratingType || 'stars';

  return (
    <div className="relative mx-auto w-[240px]">
      {/* Phone Frame */}
      <div className="relative bg-zinc-950 rounded-[2rem] p-2 shadow-2xl shadow-black/50 border border-white/10">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-950 rounded-b-xl z-10" />

        {/* Screen */}
        <div
          className="rounded-[1.5rem] overflow-hidden"
          style={{ background: '#09090b' }}
        >
          {/* Top glow */}
          <div
            className="h-16 relative"
            style={{
              background: `radial-gradient(ellipse at top, ${accentColor}15, transparent 70%)`,
            }}
          />

          <div className="px-4 -mt-6 pb-6">
            {/* Card */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 backdrop-blur-sm">
              {/* Avatar */}
              <div className="text-center mb-3">
                <div
                  className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}80, ${accentColor}40)`,
                  }}
                >
                  {businessName.charAt(0).toUpperCase()}
                </div>
                <p className="text-[11px] font-semibold text-white truncate">{businessName}</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">{formTitle}</p>
              </div>

              {/* Rating Preview */}
              <div className="flex justify-center gap-1.5 mb-3">
                {ratingType === 'stars' && [1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill={s <= 4 ? accentColor : 'none'}
                    stroke={s <= 4 ? accentColor : '#52525b'}
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                {ratingType === 'emoji' && (
                  <>
                    {['\u{1F620}', '\u{1F61E}', '\u{1F610}', '\u{1F60A}', '\u{1F929}'].map((emoji, i) => (
                      <span
                        key={i}
                        className={`text-base ${i === 3 ? 'scale-110 ring-1 ring-amber-500/50 rounded-md' : 'opacity-50'}`}
                      >
                        {emoji}
                      </span>
                    ))}
                  </>
                )}
                {ratingType === 'numeric' && [1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${
                      n === 4 ? 'text-white' : 'text-zinc-500 border border-white/10'
                    }`}
                    style={{
                      backgroundColor: n === 4 ? accentColor : 'transparent',
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>

              {/* Comment field preview */}
              {content.commentEnabled !== false && (
                <div className="mb-2">
                  <div className="h-8 bg-white/5 border border-white/10 rounded-md flex items-center px-2">
                    <span className="text-[8px] text-zinc-500">Tell us more...</span>
                  </div>
                </div>
              )}

              {/* Email field preview */}
              {content.emailEnabled && (
                <div className="mb-3">
                  <div className="h-6 bg-white/5 border border-white/10 rounded-md flex items-center px-2">
                    <span className="text-[8px] text-zinc-500">Your email...</span>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div
                className="h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                }}
              >
                <span className="text-[10px] font-semibold text-white">Submit Feedback</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-2">
              <span className="text-[7px] text-zinc-600">
                Powered by <span style={{ color: accentColor }}>QRWolf</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
