'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaUploader, type UploadedFile } from '../MediaUploader';
import type { ImagesContent } from '@/lib/qr/types';

interface ImagesFormProps {
  content: Partial<ImagesContent>;
  onChange: (content: ImagesContent) => void;
}

export function ImagesForm({ content, onChange }: ImagesFormProps) {
  const existingFiles: UploadedFile[] = (content.images || []).map((img) => ({
    url: img.url,
    path: img.url.split('/').slice(-3).join('/'),
    fileName: img.fileName,
    fileSize: img.fileSize,
  }));

  const handleUpload = (files: UploadedFile[]) => {
    onChange({
      type: 'images',
      images: files.map((file) => ({
        url: file.url,
        fileName: file.fileName,
        fileSize: file.fileSize,
      })),
      title: content.title,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="galleryTitle">Gallery Title (optional)</Label>
        <Input
          id="galleryTitle"
          type="text"
          placeholder="My Photo Gallery"
          value={content.title || ''}
          onChange={(e) =>
            onChange({
              type: 'images',
              images: content.images || [],
              title: e.target.value,
            })
          }
          className="mt-1 bg-secondary/50"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Upload Images</p>
        <MediaUploader
          mediaType="image"
          multiple={true}
          maxFiles={10}
          onUpload={handleUpload}
          existingFiles={existingFiles}
        />
      </div>

      <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
        Upload up to 10 images. When scanned, users will see a gallery view.
      </p>
    </div>
  );
}
