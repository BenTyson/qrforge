'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUploader, type UploadedFile } from '../MediaUploader';
import type { VideoContent } from '@/lib/qr/types';
import { cn } from '@/lib/utils';

interface VideoFormProps {
  content: Partial<VideoContent>;
  onChange: (content: VideoContent) => void;
}

type VideoSource = 'upload' | 'embed';

export function VideoForm({ content, onChange }: VideoFormProps) {
  const [source, setSource] = useState<VideoSource>(
    content.embedUrl ? 'embed' : 'upload'
  );

  const existingFiles: UploadedFile[] = content.videoUrl
    ? [{
        url: content.videoUrl,
        path: content.videoUrl.split('/').slice(-3).join('/'),
        fileName: 'video',
        fileSize: 0,
      }]
    : [];

  const handleUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      onChange({
        type: 'video',
        videoUrl: files[0].url,
        embedUrl: undefined,
        title: content.title,
        thumbnail: content.thumbnail,
      });
    } else {
      onChange({
        type: 'video',
        videoUrl: undefined,
        embedUrl: undefined,
        title: content.title,
        thumbnail: content.thumbnail,
      });
    }
  };

  const handleEmbedChange = (embedUrl: string) => {
    onChange({
      type: 'video',
      videoUrl: undefined,
      embedUrl,
      title: content.title,
      thumbnail: content.thumbnail,
    });
  };

  return (
    <div className="space-y-4">
      {/* Source Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSource('upload')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg border transition-colors',
            source === 'upload'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary/50 border-border hover:border-primary/50'
          )}
        >
          Upload Video
        </button>
        <button
          type="button"
          onClick={() => setSource('embed')}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg border transition-colors',
            source === 'embed'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary/50 border-border hover:border-primary/50'
          )}
        >
          YouTube / Vimeo
        </button>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="videoTitle">Video Title (optional)</Label>
        <Input
          id="videoTitle"
          type="text"
          placeholder="My Video"
          value={content.title || ''}
          onChange={(e) =>
            onChange({
              type: 'video',
              videoUrl: content.videoUrl,
              embedUrl: content.embedUrl,
              title: e.target.value,
              thumbnail: content.thumbnail,
            })
          }
          className="mt-1 bg-secondary/50"
        />
      </div>

      {/* Upload or Embed */}
      {source === 'upload' ? (
        <div>
          <p className="text-sm font-medium mb-3">Upload Video</p>
          <MediaUploader
            mediaType="video"
            multiple={false}
            onUpload={handleUpload}
            existingFiles={existingFiles}
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="embedUrl">YouTube or Vimeo URL</Label>
          <Input
            id="embedUrl"
            type="url"
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            value={content.embedUrl || ''}
            onChange={(e) => handleEmbedChange(e.target.value)}
            className="mt-1 bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Paste the full URL of the YouTube or Vimeo video
          </p>
        </div>
      )}

      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        When scanned, users will see a video player page.
      </p>
    </div>
  );
}
