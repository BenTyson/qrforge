'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { VideoContent } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function VideoLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content, name')
        .eq('short_code', code)
        .eq('content_type', 'video')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      const videoContent = qrCode.content as VideoContent;
      // Use QR code name as fallback title
      if (!videoContent.title) {
        videoContent.title = qrCode.name;
      }
      setContent(videoContent);
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

  // Determine video source type
  const isEmbed = !!content.embedUrl;
  const isYouTube = content.embedUrl?.includes('youtube') || content.embedUrl?.includes('youtu.be');
  const isVimeo = content.embedUrl?.includes('vimeo');

  // Convert YouTube/Vimeo URLs to embed format if needed
  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 w-full flex flex-col">
        {/* Header */}
        {content.title && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">{content.title}</h1>
          </div>
        )}

        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center">
          {isEmbed ? (
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={getEmbedUrl(content.embedUrl!)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={content.title || 'Video'}
              />
            </div>
          ) : content.videoUrl ? (
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                src={content.videoUrl}
                className="w-full h-full"
                controls
                autoPlay={false}
                playsInline
                poster={content.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-400">No video available</p>
            </div>
          )}
        </div>

        {/* Platform indicator */}
        {isEmbed && (
          <div className="text-center mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full text-sm text-slate-400">
              {isYouTube && (
                <>
                  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </>
              )}
              {isVimeo && (
                <>
                  <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
                  </svg>
                  Vimeo
                </>
              )}
              {!isYouTube && !isVimeo && 'Embedded Video'}
            </span>
          </div>
        )}

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
