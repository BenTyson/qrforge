'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {content.title && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">{content.title}</h1>
            <p className="text-slate-400 mt-1">
              {content.images.length} {content.images.length === 1 ? 'image' : 'images'}
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {content.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="group aspect-square overflow-hidden rounded-lg bg-slate-800 relative focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm truncate">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Powered by */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Powered by{' '}
          <Link href="/" className="hover:text-primary transition-colors">
            QRWolf
          </Link>
        </p>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={content.images[selectedIndex].url}
              alt={content.images[selectedIndex].caption || `Image ${selectedIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            {content.images[selectedIndex].caption && (
              <p className="text-white text-center mt-4 text-lg">
                {content.images[selectedIndex].caption}
              </p>
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
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selectedIndex + 1} / {content.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
