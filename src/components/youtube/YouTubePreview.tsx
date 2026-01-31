'use client';

import type { YouTubeContent } from '@/lib/qr/types';

interface YouTubePreviewProps {
  content: Partial<YouTubeContent>;
  className?: string;
}

export function YouTubePreview({ content, className }: YouTubePreviewProps) {
  const accentColor = '#FF0000';

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
            {/* Video Placeholder (16:9) */}
            <div className="w-full mt-8 rounded-xl overflow-hidden bg-slate-800 border border-white/10 aspect-video flex items-center justify-center relative">
              {/* Play Button */}
              <div
                className="w-14 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
                <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>

            {/* Video Info */}
            <div className="w-full mt-4">
              <div className="flex items-start gap-3">
                {/* Channel Icon */}
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                    <polygon fill="white" points="9.545 15.568 15.818 12 9.545 8.432" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white line-clamp-2">
                    {content.videoId ? 'YouTube Video' : 'Video Title'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Channel Name</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                boxShadow: `0 4px 14px ${accentColor}40`,
              }}
            >
              Watch on YouTube
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
