'use client';

import type { GeoContent } from '@/lib/qr/types';

interface GeoPreviewProps {
  content: Partial<GeoContent>;
  className?: string;
}

export function GeoPreview({ content, className }: GeoPreviewProps) {
  const accentColor = content.accentColor || '#3B82F6';
  const locationName = content.locationName || 'Location';
  const lat = content.latitude;
  const lng = content.longitude;

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
            {/* Pin Icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mt-4 mb-3"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              }}
            >
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>

            <h2 className="text-sm font-semibold text-white text-center mb-4">{locationName}</h2>

            {/* Detail Rows */}
            <div className="w-full space-y-2.5">
              {/* Coordinates */}
              <div
                className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5"
                style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
              >
                <p className="text-[10px] text-slate-400 mb-1">Coordinates</p>
                <p className="text-xs font-mono text-white">
                  {lat != null && lng != null
                    ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                    : '0.000000, 0.000000'}
                </p>
              </div>

              {/* Address */}
              {content.address && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <p className="text-[10px] text-slate-400 mb-1">Address</p>
                  <p className="text-xs text-white">{content.address}</p>
                </div>
              )}
            </div>

            {/* Map Placeholder */}
            <div className="w-full mt-4 rounded-xl overflow-hidden border border-white/10 bg-slate-800/50 aspect-[4/3] relative">
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-0 right-0 border-t border-slate-400" />
                <div className="absolute top-2/4 left-0 right-0 border-t border-slate-400" />
                <div className="absolute top-3/4 left-0 right-0 border-t border-slate-400" />
                <div className="absolute left-1/4 top-0 bottom-0 border-l border-slate-400" />
                <div className="absolute left-2/4 top-0 bottom-0 border-l border-slate-400" />
                <div className="absolute left-3/4 top-0 bottom-0 border-l border-slate-400" />
              </div>
              {/* Center pin */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill={accentColor}
                  stroke="white"
                  strokeWidth="1"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" fill="white" />
                </svg>
              </div>
              <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-slate-500">
                Map preview
              </p>
            </div>

            {/* Buttons */}
            <div className="w-full mt-4 flex gap-2">
              <button
                className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  boxShadow: `0 4px 14px ${accentColor}30`,
                }}
              >
                Get Directions
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold text-white bg-slate-700/70 border border-white/10"
              >
                Google Maps
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
