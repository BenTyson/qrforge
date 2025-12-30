'use client';

import type { ImagesContent } from '@/lib/qr/types';

interface GalleryPreviewProps {
  content: Partial<ImagesContent>;
  className?: string;
}

export function GalleryPreview({ content, className }: GalleryPreviewProps) {
  const title = content.title || 'Photo Gallery';
  const images = content.images || [];

  return (
    <div className={className}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #14b8a615 0%, #0f172a 50%, #14b8a610 100%)',
          }}
        >
          {/* Floating decorations */}
          <div className="absolute top-10 right-8 w-32 h-32 rounded-full blur-3xl opacity-20 bg-primary" />
          <div className="absolute bottom-20 left-4 w-24 h-24 rounded-full blur-2xl opacity-15 bg-primary" />

          {/* Content */}
          <div className="relative h-full px-4 py-6 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-4 animate-fade-in">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              {images.length > 0 ? (
                images.slice(0, 6).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-800/50 border border-white/5"
                    style={{ animationDelay: `${100 + index * 50}ms` }}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                // Placeholder grid
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center"
                    >
                      <svg
                        className="w-8 h-8 text-slate-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* More indicator */}
            {images.length > 6 && (
              <div className="text-center mt-3 text-xs text-slate-400">
                +{images.length - 6} more images
              </div>
            )}

            {/* Powered by */}
            <p className="mt-auto pt-4 text-[10px] text-slate-500 text-center">
              Powered by QRWolf
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
