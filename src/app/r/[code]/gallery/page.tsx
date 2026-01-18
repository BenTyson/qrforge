'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import type { ImagesContent } from '@/lib/qr/types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function GalleryLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<ImagesContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', 'images')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setContent(qrCode.content as ImagesContent);
      setLoading(false);
    }

    fetchData();
  }, [params]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null || !content) return;

    if (e.key === 'Escape') {
      setSelectedIndex(null);
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) =>
        prev !== null ? (prev - 1 + content.images.length) % content.images.length : null
      );
    } else if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) =>
        prev !== null ? (prev + 1) % content.images.length : null
      );
    }
  }, [selectedIndex, content]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

  const accentColor = '#14b8a6'; // Default teal accent

  return (
    <div
      className="min-h-screen py-8 px-4 relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top, ${accentColor}15 0%, transparent 50%),
                     radial-gradient(ellipse at bottom right, ${accentColor}10 0%, transparent 50%),
                     linear-gradient(to bottom, #0f172a, #1e293b)`,
      }}
    >
      {/* Floating orbs */}
      <div
        className="absolute top-20 right-[10%] w-72 h-72 rounded-full blur-3xl opacity-15 animate-pulse"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute bottom-40 left-[5%] w-56 h-56 rounded-full blur-2xl opacity-10 animate-pulse"
        style={{ backgroundColor: accentColor, animationDelay: '1s' }}
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div
          className="text-center mb-8 animate-fade-in"
        >
          {content.title && (
            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{ textShadow: `0 0 40px ${accentColor}30` }}
            >
              {content.title}
            </h1>
          )}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur rounded-full border border-white/10"
          >
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-slate-300 text-sm">
              {content.images.length} {content.images.length === 1 ? 'image' : 'images'}
            </span>
          </div>
        </div>

        {/* Gallery Grid - Masonry-style */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          {content.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 hover:border-white/20 animate-fade-in"
              style={{
                animationDelay: `${150 + index * 50}ms`,
                boxShadow: `0 8px 32px ${accentColor}10`,
              }}
            >
              <Image
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Zoom icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20"
                  style={{ backgroundColor: `${accentColor}30` }}
                >
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
              {/* Caption */}
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium truncate">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
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

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={() => setSelectedIndex(null)}
        >
          {/* Blur background */}
          <div className="absolute inset-0 backdrop-blur-sm" />

          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all z-10"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Navigation - Previous */}
          {content.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null ? (prev - 1 + content.images.length) % content.images.length : null
                );
              }}
              className="absolute left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all z-10"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={content.images[selectedIndex].url}
              alt={content.images[selectedIndex].caption || `Image ${selectedIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              unoptimized
            />
            {content.images[selectedIndex].caption && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full text-center">
                <p className="text-white text-lg font-medium px-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-full inline-block">
                  {content.images[selectedIndex].caption}
                </p>
              </div>
            )}
          </div>

          {/* Navigation - Next */}
          {content.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) =>
                  prev !== null ? (prev + 1) % content.images.length : null
                );
              }}
              className="absolute right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all z-10"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-full text-white/70 text-sm">
            {selectedIndex + 1} / {content.images.length}
          </div>

          {/* Thumbnail strip */}
          {content.images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg max-w-[80vw] overflow-x-auto">
              {content.images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    index === selectedIndex
                      ? 'ring-2 ring-primary scale-110'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
