'use client';

import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { GeoContent } from '@/lib/qr/types';
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

export default function LocationLandingPage({ params }: PageProps) {
  const [content, setContent] = useState<GeoContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { code } = await params;
      const supabase = createClient();

      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('content')
        .eq('short_code', code)
        .eq('content_type', 'geo')
        .single();

      if (error || !qrCode) {
        setLoading(false);
        return;
      }

      setContent(qrCode.content as GeoContent);
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

  const accentColor = content.accentColor || '#3B82F6';

  // Build map URLs
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${content.latitude},${content.longitude}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${content.latitude},${content.longitude}`;
  const appleMapsUrl = content.locationName
    ? `https://maps.apple.com/?ll=${content.latitude},${content.longitude}&q=${encodeURIComponent(content.locationName)}`
    : `https://maps.apple.com/?ll=${content.latitude},${content.longitude}`;

  // OpenStreetMap embed URL
  const delta = 0.01;
  const bbox = `${content.longitude - delta},${content.latitude - delta},${content.longitude + delta},${content.latitude + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${content.latitude},${content.longitude}`;

  // Link to interactive map (fallback)
  const osmLinkUrl = `https://www.openstreetmap.org/?mlat=${content.latitude}&mlon=${content.longitude}#map=15/${content.latitude}/${content.longitude}`;

  const handleOpenGoogleMaps = () => {
    window.open(googleMapsSearchUrl, '_blank');
  };

  const handleOpenAppleMaps = () => {
    window.open(appleMapsUrl, '_blank');
  };

  const handleGetDirections = () => {
    window.open(googleMapsDirectionsUrl, '_blank');
  };

  return (
    <LandingBackground accentColor={accentColor} className="py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <LandingCard>
          <LandingCardContent>
            {/* Location Icon */}
            <div
              className="text-center mb-6 animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
                }}
              >
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {content.locationName || 'Location'}
              </h1>
            </div>

            {/* Location Details */}
            <div
              className="space-y-4 mb-6 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              {/* Coordinates */}
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
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Coordinates</p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {content.latitude.toFixed(6)}, {content.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Address */}
              {content.address && (
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
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Address</p>
                    <p className="text-xs text-zinc-400">{content.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Map Embed */}
            <div
              className="mb-6 rounded-xl overflow-hidden border border-white/10 animate-slide-up"
              style={{ animationDelay: '250ms' }}
            >
              <iframe
                src={osmEmbedUrl}
                width="100%"
                height="180"
                style={{ border: 0 }}
                loading="lazy"
                title="Location map"
                className="w-full bg-zinc-800/30"
              />
              <a
                href={osmLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-zinc-800/50 px-3 py-2 text-center text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                View on OpenStreetMap
              </a>
            </div>

            {/* Action Buttons */}
            <div
              className="space-y-3 animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              {/* Get Directions - Primary CTA */}
              <button
                onClick={handleGetDirections}
                className="w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                Get Directions
              </button>

              {/* Open in Google Maps */}
              <button
                onClick={handleOpenGoogleMaps}
                className="w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, #4285F4, #3367D6)`,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Open in Google Maps
              </button>

              {/* Open in Apple Maps */}
              <button
                onClick={handleOpenAppleMaps}
                className="w-full p-4 rounded-xl text-center font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 bg-gradient-to-r from-zinc-700 to-zinc-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Open in Apple Maps
              </button>
            </div>
          </LandingCardContent>
        </LandingCard>

        <LandingFooter accentColor={accentColor} />
      </div>
    </LandingBackground>
  );
}
