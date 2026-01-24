'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SpotifyContent } from '@/lib/qr/types';
import { parseSpotifyUrl, getSpotifyContentTypeLabel } from '@/lib/spotify';

interface SpotifyFormProps {
  content: Partial<SpotifyContent>;
  onChange: (content: SpotifyContent) => void;
}

// Check if running on localhost (embeds blocked)
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export function SpotifyForm({ content, onChange }: SpotifyFormProps) {
  const handleChange = (value: string) => {
    const parsed = parseSpotifyUrl(value);
    if (parsed) {
      onChange({
        type: 'spotify',
        spotifyUrl: value.trim(),
        spotifyId: parsed.id,
        contentType: parsed.contentType,
      });
    } else {
      // Keep the URL but clear the ID if invalid
      onChange({
        type: 'spotify',
        spotifyUrl: value.trim(),
        spotifyId: '',
        contentType: 'track',
      });
    }
  };

  const spotifyId = content.spotifyId || '';
  const contentType = content.contentType;
  const previewUrl = spotifyId ? `https://open.spotify.com/${contentType}/${spotifyId}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="spotifyUrl">Spotify URL</Label>
        <Input
          id="spotifyUrl"
          type="text"
          placeholder="open.spotify.com/track/... or spotify:track:..."
          value={content.spotifyUrl || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Paste a Spotify link for a track, album, playlist, artist, or podcast
        </p>
      </div>

      {spotifyId && contentType && (
        <div className="space-y-3">
          {/* Content type badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-[#1DB954]/20 text-[#1DB954] px-2 py-1 rounded-full">
              {getSpotifyContentTypeLabel(contentType)}
            </span>
          </div>

          {/* Spotify embed preview - placeholder on localhost */}
          <div className="rounded-lg overflow-hidden bg-secondary/30">
            {isLocalhost ? (
              <div
                className="flex flex-col items-center justify-center bg-[#121212] text-white"
                style={{ height: contentType === 'track' ? 152 : 352 }}
              >
                <svg className="w-12 h-12 text-[#1DB954] mb-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <p className="text-sm text-slate-400">Spotify embed preview</p>
                <p className="text-xs text-slate-500 mt-1">(Blocked on localhost)</p>
              </div>
            ) : (
              <iframe
                src={`https://open.spotify.com/embed/${contentType}/${spotifyId}?theme=0`}
                width="100%"
                height={contentType === 'track' ? 152 : 352}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
              />
            )}
          </div>

          {/* Preview URL */}
          <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
            <span className="font-medium">Spotify ID:</span>{' '}
            <span className="text-primary font-mono">{spotifyId}</span>
          </div>

          <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
            <span className="font-medium">Opens:</span>{' '}
            <span className="text-primary">{previewUrl}</span>
          </div>
        </div>
      )}
    </div>
  );
}
