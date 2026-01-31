'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FeedbackContent } from '@/lib/qr/types';
import {
  LandingBackground,
  LandingCard,
  LandingCardContent,
  LandingFooter,
  LandingLoader,
} from '@/components/landing';

interface PageProps {
  params: Promise<{ code: string }>;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error' | 'limit_reached';

const EMOJI_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];
const EMOJI_FACES = ['\u{1F620}', '\u{1F61E}', '\u{1F610}', '\u{1F60A}', '\u{1F929}'];

export default function FeedbackLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<FeedbackContent | null>(null);
  const [qrCodeId, setQrCodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formState, setFormState] = useState<FormState>('idle');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('id, content')
        .eq('short_code', code)
        .eq('content_type', 'feedback')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setQrCodeId(qrCode.id);
      setContent(qrCode.content as FeedbackContent);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  if (loading) {
    return <LandingLoader />;
  }

  if (!content || !qrCodeId) {
    notFound();
  }

  const accentColor = content.accentColor || '#f59e0b';
  const formTitle = content.formTitle || 'How was your experience?';
  const thankYouMessage = content.thankYouMessage || 'Thank you for your feedback!';

  const handleSubmit = async () => {
    if (rating === null) return;

    setFormState('submitting');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/feedback/${qrCodeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: content.commentEnabled ? comment.trim() : undefined,
          email: content.emailEnabled ? email.trim() : undefined,
          honeypot,
        }),
      });

      if (res.status === 201) {
        setFormState('success');
      } else if (res.status === 403) {
        const data = await res.json();
        if (data.error === 'limit_reached') {
          setFormState('limit_reached');
        } else {
          setFormState('error');
          setErrorMessage('Unable to submit feedback. Please try again.');
        }
      } else if (res.status === 429) {
        setFormState('error');
        setErrorMessage('Too many submissions. Please wait a moment and try again.');
      } else {
        setFormState('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    } catch {
      setFormState('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  // Stars rating component
  const renderStars = () => (
    <div className="flex justify-center gap-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onPointerDown={() => setRating(star)}
          className="transition-all duration-200 transform hover:scale-110 active:scale-95"
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <svg
            className="w-11 h-11"
            viewBox="0 0 24 24"
            fill={rating !== null && star <= rating ? accentColor : 'none'}
            stroke={rating !== null && star <= rating ? accentColor : '#71717a'}
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );

  // Emoji rating component
  const renderEmoji = () => (
    <div className="flex justify-center gap-3">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onPointerDown={() => setRating(value)}
          className={`flex flex-col items-center gap-1 transition-all duration-200 rounded-xl p-2 ${
            rating === value
              ? 'scale-110'
              : 'opacity-70 hover:opacity-100 hover:scale-105'
          }`}
          style={{
            minWidth: 44,
            minHeight: 44,
            boxShadow: rating === value ? `0 0 0 2px ${accentColor}` : undefined,
          }}
          aria-label={`Rate ${EMOJI_LABELS[value - 1]}`}
        >
          <span className="text-3xl">{EMOJI_FACES[value - 1]}</span>
          <span className="text-[10px] text-zinc-400">{EMOJI_LABELS[value - 1]}</span>
        </button>
      ))}
    </div>
  );

  // Numeric rating component
  const renderNumeric = () => (
    <div className="flex justify-center gap-3">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onPointerDown={() => setRating(value)}
          className={`w-12 h-12 rounded-xl text-lg font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 border ${
            rating === value
              ? 'text-white border-transparent'
              : 'text-zinc-400 border-white/10 hover:border-white/20'
          }`}
          style={{
            backgroundColor: rating === value ? accentColor : 'transparent',
            minWidth: 44,
            minHeight: 44,
          }}
          aria-label={`Rate ${value}`}
        >
          {value}
        </button>
      ))}
    </div>
  );

  const renderRating = () => {
    switch (content.ratingType) {
      case 'emoji': return renderEmoji();
      case 'numeric': return renderNumeric();
      default: return renderStars();
    }
  };

  // Success state
  if (formState === 'success') {
    return (
      <LandingBackground accentColor={accentColor} className="py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <LandingCard>
            <LandingCardContent>
              <div className="text-center py-8 animate-slide-up">
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-white mb-2">{thankYouMessage}</p>
                <p className="text-sm text-zinc-400">Your feedback helps us improve.</p>
                {content.ctaUrl && (
                  <a
                    href={content.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                      boxShadow: `0 8px 24px ${accentColor}40`,
                    }}
                  >
                    {content.ctaLabel || 'Visit Our Website'}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            </LandingCardContent>
          </LandingCard>
          <LandingFooter accentColor={accentColor} />
        </div>
      </LandingBackground>
    );
  }

  // Limit reached state
  if (formState === 'limit_reached') {
    return (
      <LandingBackground accentColor={accentColor} className="py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <LandingCard>
            <LandingCardContent>
              <div className="text-center py-8 animate-slide-up">
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-white mb-2">This form is temporarily unavailable</p>
                <p className="text-sm text-zinc-400">Please try again later.</p>
              </div>
            </LandingCardContent>
          </LandingCard>
          <LandingFooter accentColor={accentColor} />
        </div>
      </LandingBackground>
    );
  }

  // Idle / error state (the form)
  return (
    <LandingBackground accentColor={accentColor} className="py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <LandingCard>
          <LandingCardContent>
            {/* Header */}
            <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}80, ${accentColor}40)`,
                  boxShadow: `0 8px 24px ${accentColor}20`,
                }}
              >
                {content.businessName.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-white">{content.businessName}</h1>
              <p className="text-zinc-400 text-sm mt-2">{formTitle}</p>
            </div>

            {/* Rating */}
            <div className="mb-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              {renderRating()}
            </div>

            {/* Comment */}
            {content.commentEnabled && (
              <div className="mb-4 animate-slide-up" style={{ animationDelay: '250ms' }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more (optional)"
                  maxLength={1000}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: accentColor } as React.CSSProperties}
                />
                <p className="text-[10px] text-zinc-500 text-right mt-1">{comment.length}/1000</p>
              </div>
            )}

            {/* Email */}
            {content.emailEnabled && (
              <div className="mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ focusRingColor: accentColor } as React.CSSProperties}
                />
              </div>
            )}

            {/* Honeypot (invisible to users) */}
            <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            {/* Error message */}
            {formState === 'error' && errorMessage && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
              <button
                onClick={handleSubmit}
                disabled={rating === null || formState === 'submitting'}
                className="w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: rating !== null
                    ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                    : undefined,
                  backgroundColor: rating === null ? '#3f3f46' : undefined,
                  boxShadow: rating !== null ? `0 8px 24px ${accentColor}40` : undefined,
                }}
              >
                {formState === 'submitting' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>

              {formState === 'error' && (
                <button
                  onClick={() => {
                    setFormState('idle');
                    setErrorMessage('');
                  }}
                  className="w-full mt-2 p-3 rounded-xl text-center text-sm font-medium text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  Try Again
                </button>
              )}
            </div>
          </LandingCardContent>
        </LandingCard>

        <LandingFooter accentColor={accentColor} />
      </div>
    </LandingBackground>
  );
}
