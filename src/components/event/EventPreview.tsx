'use client';

import type { EventContent } from '@/lib/qr/types';

interface EventPreviewProps {
  content: Partial<EventContent>;
  className?: string;
}

export function EventPreview({ content, className }: EventPreviewProps) {
  const accentColor = content.accentColor || '#3B82F6';
  const title = content.title || 'Event Name';

  const formatDateTime = (dateStr: string, allDay?: boolean) => {
    try {
      const date = new Date(dateStr);
      if (allDay) return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      return date.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const hasStart = !!content.startDate;
  const hasEnd = !!content.endDate;

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
            {/* Calendar Icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mt-4 mb-3"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              }}
            >
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>

            <h2 className="text-sm font-semibold text-white text-center mb-4">{title}</h2>

            {/* Detail Rows */}
            <div className="w-full space-y-2.5">
              {/* Date/Time */}
              <div
                className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5 flex items-start gap-3"
                style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}20` }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">Date & Time</p>
                  {hasStart ? (
                    <>
                      <p className="text-xs text-white">{formatDateTime(content.startDate!, content.allDay)}</p>
                      {hasEnd && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          to {formatDateTime(content.endDate!, content.allDay)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-500">Not set</p>
                  )}
                </div>
              </div>

              {/* Location */}
              {content.location && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5 flex items-start gap-3"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}20` }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Location</p>
                    <p className="text-xs text-white">{content.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {content.description && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5 flex items-start gap-3"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}20` }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                      <line x1="17" y1="10" x2="3" y2="10" />
                      <line x1="21" y1="6" x2="3" y2="6" />
                      <line x1="21" y1="14" x2="3" y2="14" />
                      <line x1="17" y1="18" x2="3" y2="18" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Description</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{content.description}</p>
                  </div>
                </div>
              )}

              {/* URL */}
              {content.url && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5 flex items-start gap-3"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}20` }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Event Link</p>
                    <p className="text-xs text-white truncate">{content.url}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar Buttons */}
            <div className="w-full mt-4 flex gap-2">
              <button
                className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  boxShadow: `0 4px 14px ${accentColor}30`,
                }}
              >
                Google Calendar
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold text-white bg-slate-700/70 border border-white/10"
              >
                Apple Calendar
              </button>
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
