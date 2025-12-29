'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UploadedFile {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
}

interface MediaUploaderProps {
  mediaType: 'pdf' | 'image' | 'video' | 'audio';
  multiple?: boolean;
  maxFiles?: number;
  onUpload: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  disabled?: boolean;
}

const FILE_CONFIG = {
  pdf: {
    accept: '.pdf',
    label: 'PDF files',
    maxSize: '10MB',
    icon: (
      <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  image: {
    accept: '.jpg,.jpeg,.png,.gif,.webp',
    label: 'Images',
    maxSize: '5MB each',
    icon: (
      <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  video: {
    accept: '.mp4,.webm,.mov',
    label: 'Videos',
    maxSize: '100MB',
    icon: (
      <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  audio: {
    accept: '.mp3,.wav,.ogg,.m4a',
    label: 'Audio files',
    maxSize: '20MB',
    icon: (
      <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function MediaUploader({
  mediaType,
  multiple = false,
  maxFiles = 10,
  onUpload,
  existingFiles = [],
  disabled = false,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = FILE_CONFIG[mediaType];

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const filesToUpload = Array.from(selectedFiles).slice(0, maxFiles - files.length);
    const newFiles: UploadedFile[] = [];
    let uploadedCount = 0;

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      try {
        const response = await fetch('/api/qr/upload-media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();
        newFiles.push(data);
        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / filesToUpload.length) * 100));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        break;
      }
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onUpload(updatedFiles);
    setIsUploading(false);
    setUploadProgress(0);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [files, maxFiles, mediaType, onUpload]);

  const handleRemove = useCallback(async (index: number) => {
    const fileToRemove = files[index];

    // Delete from storage
    try {
      await fetch('/api/qr/upload-media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fileToRemove.path }),
      });
    } catch (err) {
      console.error('Failed to delete file:', err);
    }

    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onUpload(updated);
  }, [files, onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [disabled, handleFileSelect]);

  const canAddMore = multiple ? files.length < maxFiles : files.length === 0;

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {canAddMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-secondary/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={config.accept}
            multiple={multiple}
            className="hidden"
            disabled={disabled}
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {isUploading ? (
            <div className="space-y-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
              <div className="w-full max-w-xs mx-auto h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto w-fit">{config.icon}</div>
              <p className="mt-2 font-medium">
                {isDragging ? 'Drop files here' : 'Click or drag to upload'}
              </p>
              <p className="text-sm text-muted-foreground">
                {config.label} up to {config.maxSize}
              </p>
            </>
          )}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={file.path}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 shrink-0">{config.icon}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {error}
        </p>
      )}

      {/* Max files note */}
      {multiple && files.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {files.length} of {maxFiles} files uploaded
        </p>
      )}
    </div>
  );
}
