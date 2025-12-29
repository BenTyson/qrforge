'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import type { MP3Content } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function AudioLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<MP3Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content, name')
        .eq('short_code', code)
        .eq('content_type', 'mp3')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      const audioContent = qrCode.content as MP3Content;
      // Use QR code name as fallback title
      if (!audioContent.title) {
        audioContent.title = qrCode.name;
      }
      setContent(audioContent);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  // Check if using embed (Spotify, SoundCloud, etc.)
  const isEmbed = !!content.embedUrl;
  const isSpotify = content.embedUrl?.includes('spotify');
  const isSoundCloud = content.embedUrl?.includes('soundcloud');

  // Convert Spotify/SoundCloud URLs to embed format if needed
  const getEmbedUrl = (url: string): string => {
    if (url.includes('open.spotify.com/track/')) {
      const trackId = url.split('track/')[1]?.split('?')[0];
      return `https://open.spotify.com/embed/track/${trackId}`;
    }
    if (url.includes('soundcloud.com') && !url.includes('w.soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2314b8a6&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {isEmbed ? (
          // Embedded player (Spotify, SoundCloud, etc.)
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 shadow-xl border border-slate-700/50">
            {content.title && (
              <h1 className="text-xl font-bold text-white text-center mb-4">{content.title}</h1>
            )}
            <div className="rounded-lg overflow-hidden">
              {isSpotify ? (
                <iframe
                  src={getEmbedUrl(content.embedUrl!)}
                  className="w-full h-[352px]"
                  allow="encrypted-media"
                  title={content.title || 'Audio'}
                />
              ) : isSoundCloud ? (
                <iframe
                  src={getEmbedUrl(content.embedUrl!)}
                  className="w-full h-[166px]"
                  allow="autoplay"
                  title={content.title || 'Audio'}
                />
              ) : (
                <iframe
                  src={content.embedUrl}
                  className="w-full h-[200px]"
                  title={content.title || 'Audio'}
                />
              )}
            </div>
          </div>
        ) : content.audioUrl ? (
          // Custom audio player for uploaded files
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 shadow-xl border border-slate-700/50">
            {/* Cover Art */}
            <div className="flex justify-center mb-6">
              {content.coverImage ? (
                <img
                  src={content.coverImage}
                  alt={content.title || 'Cover'}
                  className="w-48 h-48 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 rounded-xl bg-slate-700 flex items-center justify-center">
                  <svg className="w-20 h-20 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title & Artist */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-white">{content.title || 'Untitled'}</h1>
              {content.artist && (
                <p className="text-slate-400 mt-1">{content.artist}</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              {/* Rewind */}
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, currentTime - 10);
                  }
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 19 2 12 11 5 11 19" fill="currentColor" />
                  <polygon points="22 19 13 12 22 5 22 19" fill="currentColor" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              {/* Forward */}
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                  }
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 19 22 12 13 5 13 19" fill="currentColor" />
                  <polygon points="2 19 11 12 2 5 2 19" fill="currentColor" />
                </svg>
              </button>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={content.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 shadow-xl border border-slate-700/50 text-center">
            <p className="text-slate-400">No audio available</p>
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
