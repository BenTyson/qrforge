'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { EventContent } from '@/lib/qr/types';
import { generateGoogleCalendarUrl, generateOutlookUrl, downloadICS } from '@/lib/calendar';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function EventLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<EventContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', 'event')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setContent(qrCode.content as EventContent);
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

  const accentColor = content.accentColor || '#3B82F6';
  const startDate = new Date(content.startDate);
  const endDate = new Date(content.endDate);

  // Format date for display
  const formatDisplayDate = (date: Date, allDay?: boolean) => {
    if (allDay) {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(content), '_blank');
  };

  const handleOutlook = () => {
    window.open(generateOutlookUrl(content), '_blank');
  };

  const handleAppleCalendar = () => {
    downloadICS(content);
  };

  const handleDownloadICS = () => {
    downloadICS(content);
  };

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
        {/* Event Card */}
        <div
          className="relative bg-slate-800/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 animate-fade-in"
          style={{ boxShadow: `0 25px 50px -12px ${accentColor}30` }}
        >
          <div className="p-8">
            {/* Calendar Icon */}
            <div
              className="text-center mb-6 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                  boxShadow: `0 8px 24px ${accentColor}20`,
                }}
              >
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">{content.title}</h1>
            </div>

            {/* Event Details */}
            <div
              className="space-y-4 mb-8 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {content.allDay ? 'All Day' : formatDisplayDate(startDate, content.allDay)}
                  </p>
                  {content.allDay ? (
                    <p className="text-xs text-slate-400">
                      {formatDisplayDate(startDate, true)}
                      {content.startDate !== content.endDate && (
                        <> - {formatDisplayDate(endDate, true)}</>
                      )}
                    </p>
                  ) : (
                    content.startDate.slice(0, 10) !== content.endDate.slice(0, 10) && (
                      <p className="text-xs text-slate-400">
                        to {formatDisplayDate(endDate)}
                      </p>
                    )
                  )}
                </div>
              </div>

              {/* Location */}
              {content.location && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accentColor}
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{content.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {content.description && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accentColor}
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{content.description}</p>
                  </div>
                </div>
              )}

              {/* Event URL */}
              {content.url && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={accentColor}
                      strokeWidth="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline truncate block"
                      style={{ color: accentColor }}
                    >
                      {content.url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Calendar Buttons */}
            <div
              className="space-y-3 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <p className="text-center text-sm font-medium text-slate-400 mb-4">
                Add to your calendar
              </p>

              {/* Google Calendar */}
              <button
                onClick={handleGoogleCalendar}
                className="w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, #4285F4, #3367D6)`,
                  boxShadow: `0 8px 24px rgba(66, 133, 244, 0.4)`,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.337 3.663-8 8-8V2C6.579 2 2 6.579 2 12s4.579 10 10 10z" />
                  <path d="M14.121 9.879l1.414 1.414L12 14.828 8.465 11.293l1.414-1.414L12 12l2.121-2.121z" />
                </svg>
                Google Calendar
              </button>

              {/* Apple Calendar / iCal */}
              <button
                onClick={handleAppleCalendar}
                className="w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 bg-gradient-to-r from-slate-600 to-slate-700"
                style={{
                  boxShadow: `0 8px 24px rgba(71, 85, 105, 0.4)`,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple Calendar
              </button>

              {/* Outlook */}
              <button
                onClick={handleOutlook}
                className="w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, #0078D4, #005A9E)`,
                  boxShadow: `0 8px 24px rgba(0, 120, 212, 0.4)`,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.58.23h-8.547v-6.959l1.6 1.229c.102.086.215.127.34.127.124 0 .238-.041.34-.127l6.85-5.282c.076-.06.14-.13.185-.209.046-.078.07-.16.07-.244v-.002c-.023-.127-.086-.226-.19-.297-.105-.07-.218-.106-.34-.106h-.006l-8.297 6.396-2.107-1.621V5.287h10.355c.228 0 .422.078.58.235.158.157.238.35.238.578v1.287zM14.658 5.287v6.671l-5.896 4.54c-.102.085-.215.128-.34.128-.124 0-.238-.043-.34-.129l-5.895-4.54V5.287h12.471zm-6.236 8.818l4.9-3.774-4.9-3.774-4.9 3.774 4.9 3.774zm-7.184-8.818v11.426c0 .228.078.422.234.58.157.158.35.238.578.238H8.547v-6.246l-1.6 1.23c-.102.085-.215.127-.34.127-.124 0-.237-.042-.34-.127L.238 7.963C.157 7.902.094 7.832.047 7.753 0 7.674-.023 7.592-.023 7.508v-.003c.023-.127.086-.226.19-.296.105-.071.218-.107.34-.107H8.547V5.287H1.238c-.228 0-.422.078-.58.235-.157.157-.237.35-.237.578v.187z" />
                </svg>
                Outlook
              </button>

              {/* Download ICS */}
              <button
                onClick={handleDownloadICS}
                className="w-full p-3 rounded-xl text-center font-medium transition-all duration-300 border border-white/20 hover:border-white/40 text-slate-300 hover:text-white flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download .ics file
              </button>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <p
          className="mt-10 text-center text-sm text-slate-500 animate-slide-up"
          style={{ animationDelay: '400ms' }}
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
    </div>
  );
}
