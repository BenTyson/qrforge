'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUploader, type UploadedFile } from '../MediaUploader';
import type { MP3Content } from '@/lib/qr/types';
import { cn } from '@/lib/utils';

interface MP3FormProps {
  content: Partial<MP3Content>;
  onChange: (content: MP3Content) => void;
}

type AudioSource = 'upload' | 'embed';

export function MP3Form({ content, onChange }: MP3FormProps) {
  const [source, setSource] = useState<AudioSource>(
    content.embedUrl ? 'embed' : 'upload'
  );

  const existingFiles: UploadedFile[] = content.audioUrl
    ? [{
        url: content.audioUrl,
        path: content.audioUrl.split('/').slice(-3).join('/'),
        fileName: 'audio',
        fileSize: 0,
      }]
    : [];

  const handleUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      onChange({
        type: 'mp3',
        audioUrl: files[0].url,
        embedUrl: undefined,
        title: content.title,
        artist: content.artist,
        coverImage: content.coverImage,
      });
    } else {
      onChange({
        type: 'mp3',
        audioUrl: undefined,
        embedUrl: undefined,
        title: content.title,
        artist: content.artist,
        coverImage: content.coverImage,
      });
    }
  };

  const handleEmbedChange = (embedUrl: string) => {
    onChange({
      type: 'mp3',
      audioUrl: undefined,
      embedUrl,
      title: content.title,
      artist: content.artist,
      coverImage: content.coverImage,
    });
  };

  const handleFieldChange = (field: keyof MP3Content, value: string) => {
    onChange({
      type: 'mp3',
      audioUrl: content.audioUrl,
      embedUrl: content.embedUrl,
      title: content.title,
      artist: content.artist,
      coverImage: content.coverImage,
      [field]: value,
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
          Upload Audio
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
          Spotify / SoundCloud
        </button>
      </div>

      {/* Title & Artist */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="audioTitle">Track Title (optional)</Label>
          <Input
            id="audioTitle"
            type="text"
            placeholder="My Song"
            value={content.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
        <div>
          <Label htmlFor="audioArtist">Artist (optional)</Label>
          <Input
            id="audioArtist"
            type="text"
            placeholder="Artist Name"
            value={content.artist || ''}
            onChange={(e) => handleFieldChange('artist', e.target.value)}
            className="mt-1 bg-secondary/50"
          />
        </div>
      </div>

      {/* Upload or Embed */}
      {source === 'upload' ? (
        <div>
          <p className="text-sm font-medium mb-3">Upload Audio File</p>
          <MediaUploader
            mediaType="audio"
            multiple={false}
            onUpload={handleUpload}
            existingFiles={existingFiles}
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="embedUrl">Spotify or SoundCloud URL</Label>
          <Input
            id="embedUrl"
            type="url"
            placeholder="https://open.spotify.com/track/... or https://soundcloud.com/..."
            value={content.embedUrl || ''}
            onChange={(e) => handleEmbedChange(e.target.value)}
            className="mt-1 bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Paste the share URL from Spotify or SoundCloud
          </p>
        </div>
      )}

      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        When scanned, users will see an audio player page.
      </p>
    </div>
  );
}
