'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { GoogleReviewContent } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function GoogleReviewLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<GoogleReviewContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', 'google-review')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setContent(qrCode.content as GoogleReviewContent);
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

  // Default to Google Blue if no accent color
  const accentColor = content.accentColor || '#4285F4';
  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${content.placeId}`;

  return (
    <div
      className="min-h-screen py-12 px-4 flex items-center justify-center relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top, ${accentColor}15 0%, transparent 50%),
                     radial-gradient(ellipse at bottom, ${accentColor}10 0%, transparent 50%),
                     linear-gradient(to bottom, #0f172a, #1e293b)`,
      }}
    >
      {/* Floating orbs */}
      <div
        className="absolute top-20 right-[15%] w-64 h-64 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute bottom-32 left-[10%] w-48 h-48 rounded-full blur-2xl opacity-15 animate-pulse"
        style={{ backgroundColor: accentColor, animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: accentColor }}
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-md w-full relative z-10">
        {/* Review Card */}
        <div
          className="relative bg-slate-800/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 animate-fade-in"
          style={{ boxShadow: `0 25px 50px -12px ${accentColor}30` }}
        >
          <div className="p-8">
            {/* Business Logo / Initial */}
            <div
              className="text-center mb-6 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                  boxShadow: `0 8px 24px ${accentColor}20`,
                }}
              >
                {content.businessName.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold text-white">{content.businessName}</h1>
            </div>

            {/* 5 Stars Display */}
            <div
              className="flex justify-center gap-1 mb-6 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="#FBBC05"
                  style={{
                    filter: `drop-shadow(0 0 8px #FBBC0550)`,
                    animation: `star-pulse 2s ease-in-out infinite`,
                    animationDelay: `${star * 100}ms`,
                  }}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>

            {/* Message */}
            <div
              className="text-center mb-8 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <p className="text-lg text-white/90 font-medium mb-2">
                We&apos;d love your feedback!
              </p>
              <p className="text-slate-400 text-sm">
                Your review helps us improve and helps others discover us.
              </p>
            </div>

            {/* CTA Button */}
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
              style={{
                animationDelay: '400ms',
                background: `linear-gradient(135deg, #4285F4, #3367D6)`,
                boxShadow: `0 8px 24px rgba(66, 133, 244, 0.4)`,
              }}
            >
              <span className="flex items-center justify-center gap-3">
                {/* Google "G" Logo */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#ffffff"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#ffffff"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Leave a Google Review
              </span>
            </a>

            {/* Secondary Info */}
            <p
              className="text-center text-xs text-slate-500 mt-6 animate-slide-up"
              style={{ animationDelay: '500ms' }}
            >
              You&apos;ll be redirected to Google to leave your review
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p
          className="mt-10 text-center text-sm text-slate-500 animate-slide-up"
          style={{ animationDelay: '600ms' }}
        >
          Powered by{' '}
          <Link
            href="/"
            className="font-medium transition-colors hover:text-primary"
            style={{ color: accentColor }}
          >
            QRWolf
          </Link>
        </p>
      </div>

      {/* Star pulse animation */}
      <style jsx>{`
        @keyframes star-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
