'use client';

import type { WiFiContent } from '@/lib/qr/types';

interface WiFiPreviewProps {
  content: Partial<WiFiContent>;
  className?: string;
}

export function WiFiPreview({ content, className }: WiFiPreviewProps) {
  const accentColor = '#14b8a6';
  const ssid = content.ssid || 'Network Name';
  const password = content.password;
  const encryption = content.encryption || 'WPA';

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
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
            </div>

            <h2 className="text-sm font-semibold text-white mb-4">WiFi Network</h2>

            {/* Detail Cards */}
            <div className="w-full space-y-2.5">
              {/* SSID */}
              <div
                className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5"
                style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
              >
                <p className="text-[10px] text-slate-400 mb-1">Network Name</p>
                <p className="text-sm font-medium text-white">{ssid}</p>
              </div>

              {/* Password */}
              {password && (
                <div
                  className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5"
                  style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
                >
                  <p className="text-[10px] text-slate-400 mb-1">Password</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-medium text-white flex-1">{password}</p>
                    <svg
                      className="w-3.5 h-3.5 text-slate-500 flex-shrink-0"
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
              )}

              {/* Security */}
              <div
                className="w-full bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/10 p-3.5"
                style={{ boxShadow: `0 4px 16px ${accentColor}10` }}
              >
                <p className="text-[10px] text-slate-400 mb-1">Security</p>
                <p className="text-sm font-medium text-white">{encryption === 'nopass' ? 'Open (No password)' : encryption}</p>
              </div>
            </div>

            {/* How to Connect */}
            <div
              className="w-full mt-4 bg-slate-800/40 rounded-xl border border-white/5 p-3.5"
            >
              <p className="text-[10px] font-medium text-slate-400 mb-1.5">How to Connect</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Open your device&apos;s WiFi settings and select &quot;{ssid}&quot;.
                {password ? ' Enter the password shown above.' : ''}
              </p>
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
