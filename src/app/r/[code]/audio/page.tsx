'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import type { MP3Content } from '@/lib/qr/types';
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
    return <LandingLoader />;
  }

  if (!content) {
    notFound();
  }

  const accentColor = '#14b8a6';
  const isEmbed = !!content.embedUrl;
  const isSpotify = content.embedUrl?.includes('spotify');
  const isSoundCloud = content.embedUrl?.includes('soundcloud');

  const getEmbedUrl = (url: string): string => {
    if (url.includes('open.spotify.com/track/')) {
      const trackId = url.split('track/')[1]?.split('?')[0];
      return `https://open.spotify.com/embed/track/${trackId}?theme=0`;
    }
    if (url.includes('soundcloud.com') && !url.includes('w.soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2314b8a6&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
    }
    return url;
  };

  return (
    <LandingBackground accentColor={accentColor} className="py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {isEmbed ? (
          // Embedded player (Spotify, SoundCloud, etc.)
          <LandingCard>
            {/* Header */}
            <div className="p-6 pb-4">
              {content.title && (
                <h1 className="text-xl font-bold text-white text-center mb-2">{content.title}</h1>
              )}
              {content.artist && (
                <p className="text-zinc-400 text-center text-sm">{content.artist}</p>
              )}
              <div className="flex justify-center mt-4">
                {isSpotify && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span className="text-sm text-green-400 font-medium">Spotify</span>
                  </span>
                )}
                {isSoundCloud && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">
                    <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.054-.05-.1-.084-.1zm-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.19-1.308-.19-1.334c-.01-.057-.049-.094-.078-.094z"/>
                    </svg>
                    <span className="text-sm text-orange-400 font-medium">SoundCloud</span>
                  </span>
                )}
              </div>
            </div>

            {/* Embed Container */}
            <div className="rounded-xl mx-4 mb-4 overflow-hidden">
              {isSpotify ? (
                <iframe
                  src={getEmbedUrl(content.embedUrl!)}
                  className="w-full h-[352px]"
                  allow="encrypted-media"
                  title={content.title || 'Audio'}
                  style={{ borderRadius: '12px' }}
                />
              ) : isSoundCloud ? (
                <iframe
                  src={getEmbedUrl(content.embedUrl!)}
                  className="w-full h-[300px]"
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
          </LandingCard>
        ) : content.audioUrl ? (
          // Custom audio player for uploaded files
          <LandingCard>
            <LandingCardContent>
              {/* Cover Art */}
              <div
                className="flex justify-center mb-8 animate-slide-up"
                style={{ animationDelay: '100ms' }}
              >
                <div
                  className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl"
                >
                  {content.coverImage ? (
                    <Image
                      src={content.coverImage}
                      alt={content.title || 'Cover'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                      }}
                    >
                      <svg className="w-20 h-20 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  )}
                  {/* Vinyl effect overlay */}
                  <div className="absolute inset-0 border-4 border-white/10 rounded-2xl pointer-events-none" />
                </div>
              </div>

              {/* Title & Artist */}
              <div
                className="text-center mb-8 animate-slide-up"
                style={{ animationDelay: '200ms' }}
              >
                <h1 className="text-2xl font-bold text-white mb-2">
                  {content.title || 'Untitled'}
                </h1>
                {content.artist && (
                  <p className="text-lg text-zinc-400">{content.artist}</p>
                )}
              </div>

              {/* Progress Bar */}
              <div
                className="mb-6 animate-slide-up"
                style={{ animationDelay: '300ms' }}
              >
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-zinc-700/50 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${accentColor} ${(currentTime / (duration || 1)) * 100}%, rgba(63,63,70,0.5) ${(currentTime / (duration || 1)) * 100}%)`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-zinc-500 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div
                className="flex items-center justify-center gap-8 animate-slide-up"
                style={{ animationDelay: '400ms' }}
              >
                {/* Rewind */}
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = Math.max(0, currentTime - 10);
                    }
                  }}
                  className="p-3 text-zinc-400 hover:text-white transition-all hover:scale-110"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="11 19 2 12 11 5 11 19" />
                    <polygon points="22 19 13 12 22 5 22 19" />
                  </svg>
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    boxShadow: `0 8px 32px ${accentColor}50`,
                  }}
                >
                  {isPlaying ? (
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
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
                  className="p-3 text-zinc-400 hover:text-white transition-all hover:scale-110"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="13 19 22 12 13 5 13 19" />
                    <polygon points="2 19 11 12 2 5 2 19" />
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
            </LandingCardContent>
          </LandingCard>
        ) : (
          <LandingCard>
            <LandingCardContent className="text-center">
              <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <p className="text-zinc-400">No audio available</p>
            </LandingCardContent>
          </LandingCard>
        )}

        <LandingFooter accentColor={accentColor} delay={500} />
      </div>
    </LandingBackground>
  );
}
