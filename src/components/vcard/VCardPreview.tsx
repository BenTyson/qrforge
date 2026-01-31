'use client';

import type { VCardContent } from '@/lib/qr/types';

interface VCardPreviewProps {
  content: Partial<VCardContent>;
  className?: string;
}

export function VCardPreview({ content, className }: VCardPreviewProps) {
  const accentColor = '#14b8a6';
  const firstName = content.firstName || 'First';
  const lastName = content.lastName || 'Last';
  const fullName = `${firstName} ${lastName}`;
  const initial = firstName.charAt(0).toUpperCase();

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
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mt-6 mb-3 text-white font-bold text-2xl"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
              }}
            >
              {initial}
            </div>

            <h2 className="text-sm font-semibold text-white">{fullName}</h2>

            {/* Title & Org */}
            {(content.title || content.organization) && (
              <p className="text-xs text-slate-400 mt-0.5 text-center">
                {content.title}
                {content.title && content.organization ? ' at ' : ''}
                {content.organization}
              </p>
            )}

            {/* Contact Rows */}
            <div className="w-full mt-5 space-y-2.5">
              {content.phone && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5 flex items-center gap-3"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20">
                    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Phone</p>
                    <p className="text-xs text-white">{content.phone}</p>
                  </div>
                </div>
              )}

              {content.email && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5 flex items-center gap-3"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20">
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Email</p>
                    <p className="text-xs text-white truncate">{content.email}</p>
                  </div>
                </div>
              )}

              {content.url && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5 flex items-center gap-3"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
                    <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Website</p>
                    <p className="text-xs text-white truncate">{content.url}</p>
                  </div>
                </div>
              )}

              {/* Empty state if no contact info */}
              {!content.phone && !content.email && !content.url && (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-500">Add contact details to see preview</p>
                </div>
              )}
            </div>

            {/* Save Contact Button */}
            <button
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                boxShadow: `0 4px 14px ${accentColor}40`,
              }}
            >
              Save Contact
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
