'use client';

import type { TextContent } from '@/lib/qr/types';

interface TextPreviewProps {
  content: Partial<TextContent>;
  className?: string;
}

export function TextPreview({ content, className }: TextPreviewProps) {
  const accentColor = '#14b8a6';
  const text = content.text || 'Your text content will appear here...';

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
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mt-6 mb-3"
              style={{ backgroundColor: `${accentColor}25` }}
            >
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accentColor}
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>

            <h2 className="text-sm font-semibold text-white mb-4">Text Content</h2>

            {/* Text Card */}
            <div
              className="w-full bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-5"
              style={{ boxShadow: `0 8px 32px ${accentColor}15` }}
            >
              <div className="flex items-start gap-3">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6 flex-1">
                  {text}
                </p>
                <svg
                  className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </div>
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
