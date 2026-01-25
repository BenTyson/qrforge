'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { YouTubeContent } from '@/lib/qr/types';
import { getYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail, getVideoMetadata } from '@/lib/youtube';
import {
  LandingBackground,
  LandingCard,
  LandingFooter,
  LandingLoader
} from '@/components/landing';

interface PageProps {
  params: Promise<{ code: string }>;
}

interface VideoMetadata {
  title: string;
  authorName: string;
  authorUrl: string;
  thumbnailUrl: string;
}

// Check if running on localhost (YouTube embeds are blocked on localhost)
function checkIsLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export default function YouTubeLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<YouTubeContent | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const isLocalhost = checkIsLocalhost();

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', 'youtube')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      const ytContent = qrCode.content as YouTubeContent;
      setContent(ytContent);

      // Fetch video metadata
      if (ytContent.videoId) {
        const meta = await getVideoMetadata(ytContent.videoId);
        if (meta) {
          setMetadata({
            title: meta.title,
            authorName: meta.authorName,
            authorUrl: meta.authorUrl,
            thumbnailUrl: meta.thumbnailUrl,
          });
        }
      }

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

  const youtubeUrl = getYouTubeUrl(content.videoId);
  const embedUrl = getYouTubeEmbedUrl(content.videoId);
  const thumbnailUrl = metadata?.thumbnailUrl || getYouTubeThumbnail(content.videoId, 'maxres');
  const accentColor = '#FF0000'; // YouTube red

  return (
    <LandingBackground accentColor={accentColor} className="py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Video Card */}
        <LandingCard>
          {/* Video Embed or Thumbnail */}
          <div className="relative w-full aspect-video bg-black rounded-t-3xl overflow-hidden">
            {!embedError && !isLocalhost ? (
              <iframe
                src={embedUrl}
                title={metadata?.title || 'YouTube Video'}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onError={() => setEmbedError(true)}
              />
            ) : (
              // Fallback to thumbnail with play button
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative w-full h-full group"
              >
                <Image
                  src={thumbnailUrl}
                  alt={metadata?.title || 'Video thumbnail'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </a>
            )}
          </div>

          <div className="p-6">
            {/* Video Title */}
            {metadata?.title && (
              <h1
                className="text-xl font-bold text-white mb-2 animate-slide-up"
                style={{ animationDelay: '100ms' }}
              >
                {metadata.title}
              </h1>
            )}

            {/* Channel Info */}
            {metadata?.authorName && (
              <a
                href={metadata.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">{metadata.authorName}</span>
              </a>
            )}

            {/* CTA Button */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
              style={{
                animationDelay: '300ms',
                background: 'linear-gradient(135deg, #FF0000, #CC0000)',
                boxShadow: '0 8px 24px rgba(255, 0, 0, 0.4)',
              }}
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </span>
            </a>
          </div>
        </LandingCard>

        <LandingFooter accentColor={accentColor} />
      </div>
    </LandingBackground>
  );
}
