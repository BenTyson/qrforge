'use client';

import type { VideoContent } from '@/lib/qr/types';

interface VideoPreviewProps {
  content: Partial<VideoContent>;
  className?: string;
}

export function VideoPreview({ content, className }: VideoPreviewProps) {
  const title = content.title || 'My Video';
  const hasVideo = !!(content.videoUrl || content.embedUrl);
  const isYouTube = content.embedUrl?.includes('youtube') || content.embedUrl?.includes('youtu.be');
  const isVimeo = content.embedUrl?.includes('vimeo');
  const accentColor = '#14b8a6';

  return (
    <div className={className}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at top, ${accentColor}15 0%, transparent 50%),
                         radial-gradient(ellipse at bottom, #8b5cf620 0%, transparent 50%),
                         linear-gradient(to bottom, #0f172a, #1e293b)`,
          }}
        >
          {/* Floating decorations */}
          <div
            className="absolute top-10 right-8 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: accentColor }}
          />
          <div className="absolute bottom-20 left-4 w-24 h-24 rounded-full blur-2xl opacity-15 bg-purple-500" />

          {/* Content */}
          <div className="relative h-full px-4 py-6 flex flex-col overflow-y-auto">
            {/* Title */}
            <h2 className="text-sm font-semibold text-white text-center mb-4 animate-fade-in">
              {title}
            </h2>

            {/* Video Player */}
            <div
              className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 animate-slide-up"
              style={{ animationDelay: '100ms', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {hasVideo ? (
                <>
                  {/* Simulated video content */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: isYouTube
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                          : isVimeo
                          ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                          : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      }}
                    >
                      <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Video progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full w-1/3 bg-primary" />
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50">
                  <svg className="w-12 h-12 text-slate-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <p className="text-xs text-slate-500">No video</p>
                </div>
              )}
            </div>

            {/* Platform badge */}
            {(isYouTube || isVimeo) && (
              <div
                className="flex items-center justify-center gap-2 mt-4 animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/10">
                  {isYouTube && (
                    <>
                      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span className="text-xs text-slate-300">YouTube</span>
                    </>
                  )}
                  {isVimeo && (
                    <>
                      <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
                      </svg>
                      <span className="text-xs text-slate-300">Vimeo</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Video controls hint */}
            <div
              className="mt-auto pt-4 flex justify-center gap-4 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="text-slate-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </div>
              <div className="text-white">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                </svg>
              </div>
              <div className="text-slate-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </div>
            </div>

            {/* Powered by */}
            <p className="mt-4 text-[10px] text-slate-500 text-center">
              Powered by QRWolf
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
