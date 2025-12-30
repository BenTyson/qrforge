'use client';

import type { CouponContent } from '@/lib/qr/types';

interface CouponPreviewProps {
  content: Partial<CouponContent>;
  className?: string;
}

export function CouponPreview({ content, className }: CouponPreviewProps) {
  const accentColor = content.accentColor || '#14b8a6';
  const businessName = content.businessName || 'Your Business';
  const headline = content.headline || '20% OFF';
  const description = content.description || 'Your entire purchase';
  const code = content.code;
  const validUntil = content.validUntil;
  const terms = content.terms;
  const logoUrl = content.logoUrl;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={className}>
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
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
            {/* Coupon Card */}
            <div
              className="w-full bg-slate-800/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-lg mt-4"
              style={{ boxShadow: `0 8px 32px ${accentColor}15` }}
            >
              {/* Coupon perforations */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 rounded-r-full"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}15 0%, #0f172a 50%)`,
                }}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 rounded-l-full"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}15 0%, #0f172a 50%)`,
                }}
              />

              <div className="p-5">
                {/* Logo & Business Name */}
                <div className="text-center mb-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={businessName}
                      className="h-10 mx-auto mb-2 object-contain"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: `${accentColor}30` }}
                    >
                      {businessName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-sm font-medium text-slate-300">{businessName}</h2>
                </div>

                {/* Main Offer */}
                <div className="text-center py-4 border-y border-dashed border-slate-600/50">
                  <p
                    className="text-3xl font-bold mb-1 animate-fade-in"
                    style={{ color: accentColor }}
                  >
                    {headline}
                  </p>
                  <p className="text-sm text-white/90">{description}</p>
                </div>

                {/* Promo Code */}
                {code && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 text-center mb-2">Use code:</p>
                    <div
                      className="p-3 bg-slate-700/50 rounded-lg border-2 border-dashed flex items-center justify-center gap-2"
                      style={{ borderColor: `${accentColor}40` }}
                    >
                      <span className="text-lg font-mono font-bold text-white tracking-wider">
                        {code}
                      </span>
                      <svg
                        className="w-4 h-4 text-slate-400"
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

                {/* Validity */}
                {validUntil && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-slate-400">
                      Valid until:{' '}
                      <span className="text-white">{formatDate(validUntil)}</span>
                    </p>
                  </div>
                )}

                {/* Terms */}
                {terms && (
                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <p className="text-[10px] text-slate-500 text-center leading-tight">{terms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Powered by */}
            <p className="mt-4 text-[10px] text-slate-500">
              Powered by QRWolf
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
