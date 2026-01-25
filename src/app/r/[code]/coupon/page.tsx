'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { CouponContent } from '@/lib/qr/types';
import {
  LandingBackground,
  LandingCard,
  LandingCardContent,
  LandingFooter,
  LandingLoader
} from '@/components/landing';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function CouponLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<CouponContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', 'coupon')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setContent(qrCode.content as CouponContent);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  if (loading) {
    return <LandingLoader />;
  }

  if (!content) {
    notFound();
  }

  const accentColor = content.accentColor || '#14b8a6';
  const isExpired = content.validUntil ? new Date(content.validUntil) < new Date() : false;

  const copyCode = () => {
    if (content.code) {
      navigator.clipboard.writeText(content.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <LandingBackground accentColor={accentColor} className="py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <LandingCard>
          {/* Coupon perforations */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 rounded-r-full"
            style={{ backgroundColor: '#09090b' }}
          />
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 rounded-l-full"
            style={{ backgroundColor: '#09090b' }}
          />

          <LandingCardContent>
            {/* Logo & Business Name */}
            <div
              className="text-center mb-8 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              {content.logoUrl ? (
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl p-2 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}20, transparent)`,
                  }}
                >
                  <Image
                    src={content.logoUrl}
                    alt={content.businessName}
                    width={80}
                    height={80}
                    className="max-h-full max-w-full object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                  }}
                >
                  {content.businessName.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-xl font-semibold text-white">{content.businessName}</h2>
            </div>

            {/* Main Offer */}
            <div
              className="text-center py-8 border-y border-dashed border-zinc-700/50 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <p
                className="text-6xl font-black mb-3 tracking-tight"
                style={{ color: accentColor }}
              >
                {content.headline}
              </p>
              <p className="text-xl text-white/90 font-medium">{content.description}</p>
            </div>

            {/* Promo Code */}
            {content.code && (
              <div
                className="mt-8 animate-slide-up"
                style={{ animationDelay: '300ms' }}
              >
                <p className="text-sm text-zinc-400 text-center mb-3">Tap to copy code:</p>
                <button
                  onClick={copyCode}
                  disabled={isExpired}
                  className="w-full p-5 rounded-xl border-2 border-dashed flex items-center justify-center gap-4 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: `${accentColor}10`,
                    borderColor: `${accentColor}40`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpired) {
                      e.currentTarget.style.backgroundColor = `${accentColor}20`;
                      e.currentTarget.style.borderColor = `${accentColor}60`;
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${accentColor}10`;
                    e.currentTarget.style.borderColor = `${accentColor}40`;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span
                    className="text-3xl font-mono font-bold tracking-widest"
                    style={{ color: accentColor }}
                  >
                    {content.code}
                  </span>
                  <svg
                    className="w-6 h-6 text-zinc-400 transition-all duration-300 group-hover:text-white group-hover:scale-110"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {copied ? (
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </>
                    )}
                  </svg>
                </button>
                {copied && (
                  <p
                    className="text-center text-sm font-medium mt-3 animate-fade-in"
                    style={{ color: accentColor }}
                  >
                    Copied to clipboard!
                  </p>
                )}
              </div>
            )}

            {/* Validity */}
            {content.validUntil && (
              <div
                className="mt-6 text-center animate-slide-up"
                style={{ animationDelay: '400ms' }}
              >
                {isExpired ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                    <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="text-red-400 font-medium">This coupon has expired</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/30 rounded-full">
                    <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-zinc-400">
                      Valid until{' '}
                      <span className="text-white font-medium">
                        {new Date(content.validUntil).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Terms */}
            {content.terms && (
              <div
                className="mt-8 pt-6 border-t border-zinc-700/50 animate-slide-up"
                style={{ animationDelay: '500ms' }}
              >
                <p className="text-xs text-zinc-500 text-center leading-relaxed">{content.terms}</p>
              </div>
            )}
          </LandingCardContent>
        </LandingCard>

        <LandingFooter accentColor={accentColor} delay={600} />
      </div>
    </LandingBackground>
  );
}
