'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { YouTubeContent } from '@/lib/qr/types';
import { extractVideoId, getYouTubeThumbnail } from '@/lib/youtube';
import Image from 'next/image';

interface YouTubeFormProps {
  content: Partial<YouTubeContent>;
  onChange: (content: YouTubeContent) => void;
}

export function YouTubeForm({ content, onChange }: YouTubeFormProps) {
  const handleChange = (value: string) => {
    const videoId = extractVideoId(value) || '';
    onChange({
      type: 'youtube',
      videoId,
      videoUrl: value.trim(),
    });
  };

  const videoId = content.videoId || '';
  const previewUrl = videoId ? `https://youtube.com/watch?v=${videoId}` : '';

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="youtubeUrl">YouTube Video</Label>
        <Input
          id="youtubeUrl"
          type="text"
          placeholder="youtube.com/watch?v=... or youtu.be/..."
          value={content.videoUrl || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Paste a YouTube video URL or video ID
        </p>
      </div>

      {videoId && (
        <div className="space-y-3">
          {/* Thumbnail preview */}
          <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden bg-secondary/30">
            <Image
              src={getYouTubeThumbnail(videoId, 'medium')}
              alt="Video thumbnail"
              fill
              className="object-cover"
              unoptimized
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Video ID display */}
          <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
            <span className="font-medium">Video ID:</span>{' '}
            <span className="text-primary font-mono">{videoId}</span>
          </div>

          {/* Preview URL */}
          <div className="text-xs text-muted-foreground bg-secondary/30 rounded-md p-2">
            <span className="font-medium">Redirect URL:</span>{' '}
            <span className="text-primary">{previewUrl}</span>
          </div>
        </div>
      )}
    </div>
  );
}
