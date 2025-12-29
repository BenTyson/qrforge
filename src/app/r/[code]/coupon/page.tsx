'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CouponContent } from '@/lib/qr/types';

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
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    notFound();
  }

  const accentColor = content.accentColor || '#14b8a6';
  const isExpired = content.validUntil && new Date(content.validUntil) < new Date();

  const copyCode = () => {
    if (content.code) {
      navigator.clipboard.writeText(content.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${accentColor}20 0%, #0f172a 100%)`,
      }}
    >
      <div className="max-w-md w-full">
        {/* Coupon Card */}
        <div className="relative bg-slate-800/80 backdrop-blur rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
          {/* Coupon perforations */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-900 rounded-r-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-900 rounded-l-full" />

          <div className="p-6">
            {/* Logo & Business Name */}
            <div className="text-center mb-6">
              {content.logoUrl && (
                <img
                  src={content.logoUrl}
                  alt={content.businessName}
                  className="h-16 mx-auto mb-3 object-contain"
                />
              )}
              <h2 className="text-lg font-medium text-slate-300">{content.businessName}</h2>
            </div>

            {/* Main Offer */}
            <div className="text-center py-6 border-y border-dashed border-slate-600">
              <p
                className="text-5xl font-bold mb-2"
                style={{ color: accentColor }}
              >
                {content.headline}
              </p>
              <p className="text-xl text-white">{content.description}</p>
            </div>

            {/* Promo Code */}
            {content.code && (
              <div className="mt-6">
                <p className="text-sm text-slate-400 text-center mb-2">Use code:</p>
                <button
                  onClick={copyCode}
                  className="w-full p-4 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-500 flex items-center justify-center gap-3 hover:bg-slate-700 transition-colors group"
                >
                  <span className="text-2xl font-mono font-bold text-white tracking-wider">
                    {content.code}
                  </span>
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                {copied && (
                  <p className="text-center text-sm text-green-400 mt-2">
                    Copied to clipboard!
                  </p>
                )}
              </div>
            )}

            {/* Validity */}
            {content.validUntil && (
              <div className="mt-6 text-center">
                {isExpired ? (
                  <p className="text-red-400 font-medium">This coupon has expired</p>
                ) : (
                  <p className="text-slate-400">
                    Valid until:{' '}
                    <span className="text-white">
                      {new Date(content.validUntil).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Terms */}
            {content.terms && (
              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">{content.terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Powered by */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Powered by{' '}
          <Link href="/" className="hover:text-primary transition-colors">
            QRWolf
          </Link>
        </p>
      </div>
    </div>
  );
}
