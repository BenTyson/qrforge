'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { QRStyleOptions } from '@/lib/qr/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QRLogoUploaderProps {
  style: QRStyleOptions;
  onChange: (style: QRStyleOptions) => void;
  userTier?: 'free' | 'pro' | 'business';
}

export function QRLogoUploader({ style, onChange, userTier = 'free' }: QRLogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);

  const isPro = userTier === 'pro' || userTier === 'business';

  const updateStyle = (updates: Partial<QRStyleOptions>) => {
    onChange({ ...style, ...updates });
  };

  const handleFileSelect = async (file: File) => {
    if (!isPro) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please use PNG, JPG, or SVG.');
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1024 * 1024) {
      setUploadError('File too large. Maximum size is 1MB.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/qr/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setLogoPath(data.path);
      // Set logo URL and auto-bump error correction for better scanability
      updateStyle({
        logoUrl: data.url,
        logoSize: style.logoSize || 20,
        errorCorrectionLevel: style.errorCorrectionLevel === 'L' || style.errorCorrectionLevel === 'M' ? 'Q' : style.errorCorrectionLevel,
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (logoPath) {
      try {
        await fetch('/api/qr/delete-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: logoPath }),
        });
      } catch (error) {
        console.error('Failed to delete logo:', error);
      }
    }
    setLogoPath(null);
    updateStyle({ logoUrl: undefined, logoSize: undefined });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Brand Logo</p>
            <p className="text-sm text-muted-foreground">
              Add your logo to the center of the QR code
            </p>
          </div>
        </div>
        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
          Pro
        </span>
      </div>

      {isPro ? (
        <>
          {style.logoUrl ? (
            // Logo Preview
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary/50 border border-border/50">
                  <img
                    src={style.logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Remove
                </Button>
              </div>

              {/* Logo Size Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Logo Size</Label>
                  <span className="text-sm text-muted-foreground">{style.logoSize || 20}%</span>
                </div>
                <Slider
                  value={[style.logoSize || 20]}
                  onValueChange={([value]) => updateStyle({ logoSize: value })}
                  min={10}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Larger logos may affect scannability
                </p>
              </div>
            </div>
          ) : (
            // Upload Area
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30',
                isUploading && 'pointer-events-none opacity-50'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-primary animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mx-auto text-muted-foreground mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm font-medium">
                    {isDragging ? 'Drop logo here' : 'Click or drag to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, SVG - Max 1MB
                  </p>
                </>
              )}
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-destructive mt-2">{uploadError}</p>
          )}
        </>
      ) : (
        // Upgrade Prompt for Free Users
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Add your brand logo to the center of QR codes to increase brand recognition.
          </p>
          <Link href="/settings">
            <Button size="sm" className="w-full">
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
