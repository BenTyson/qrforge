'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Crown, Pencil, Trash2, Square, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { LogoUploader } from '@/components/qr/LogoUploader';
import { LogoBestPractices } from '@/components/qr/LogoBestPractices';
import { LogoCropModal } from '@/components/qr/LogoCropModal';
import type { QRStyleOptions, LogoShape } from '@/lib/qr/types';

export interface LogoTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  canAccessProTypes: boolean;
}

function RoundedSquareIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    </svg>
  );
}

export function LogoTabContent({ style, onStyleChange, canAccessProTypes }: LogoTabContentProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = useCallback((file: File) => {
    setOriginalFile(file);
    setCropModalOpen(true);
  }, []);

  const uploadBlob = useCallback(async (blob: Blob): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', new File([blob], 'logo.png', { type: 'image/png' }));
    formData.append('mediaType', 'image');
    try {
      const response = await fetch('/api/qr/upload-media', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.url as string;
    } catch {
      return null;
    }
  }, []);

  const handleCropApply = useCallback(async (
    blob: Blob,
    shape: LogoShape,
    background: { enabled: boolean; color: string }
  ) => {
    setCropModalOpen(false);
    setIsUploading(true);
    const url = await uploadBlob(blob);
    setIsUploading(false);
    if (url) {
      onStyleChange({
        ...style,
        logoUrl: url,
        logoShape: shape,
        logoBackground: background,
        errorCorrectionLevel: 'H',
      });
    }
  }, [style, onStyleChange, uploadBlob]);

  const handleRemoveLogo = useCallback(() => {
    setOriginalFile(null);
    onStyleChange({
      ...style,
      logoUrl: undefined,
      logoShape: undefined,
      logoMargin: undefined,
      logoBackground: undefined,
    });
  }, [style, onStyleChange]);

  const handleShapeChange = useCallback((newShape: LogoShape) => {
    if (originalFile) {
      onStyleChange({ ...style, logoShape: newShape });
      setCropModalOpen(true);
    } else {
      onStyleChange({ ...style, logoShape: newShape });
    }
  }, [originalFile, style, onStyleChange]);

  const handleEditCrop = useCallback(() => {
    if (originalFile) {
      setCropModalOpen(true);
    }
  }, [originalFile]);

  return (
    <div className="space-y-6">
      {/* Crop Modal */}
      <LogoCropModal
        file={originalFile}
        open={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onApply={handleCropApply}
        initialShape={style.logoShape ?? 'square'}
        initialBackground={style.logoBackground}
      />

      {/* Logo Upload Section */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Add Your Logo
        </p>

        {canAccessProTypes ? (
          <div className="space-y-4">
            {/* Show uploader when no logo, or uploading indicator */}
            {!style.logoUrl && !isUploading && (
              <>
                <LogoUploader
                  value={undefined}
                  onChange={() => {}}
                  onFileSelected={handleFileSelected}
                  placeholder="Drag & drop or click to upload"
                />
                <p className="text-xs text-slate-500">
                  PNG, JPG, SVG &bull; Max 5MB
                </p>
              </>
            )}

            {isUploading && (
              <div className="flex items-center justify-center gap-2 py-6">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Uploading logo...</span>
              </div>
            )}

            {/* Logo preview + inline controls when uploaded */}
            {style.logoUrl && !isUploading && (
              <div className="space-y-4">
                {/* Logo Thumbnail + Actions */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-600 bg-slate-900/50 relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={style.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    {originalFile ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditCrop}
                        className="border-slate-600 text-slate-300 h-8"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Re-upload to crop again
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="border-slate-600 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Shape Selector */}
                <div className="pt-3 border-t border-slate-700">
                  <Label className="text-white text-sm mb-2 block">Shape</Label>
                  <div className="flex gap-2">
                    {([
                      { value: 'square' as const, icon: <Square className="w-4 h-4" />, label: 'Square' },
                      { value: 'rounded' as const, icon: <RoundedSquareIcon />, label: 'Rounded' },
                      { value: 'circle' as const, icon: <Circle className="w-4 h-4" />, label: 'Circle' },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleShapeChange(opt.value)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                          (style.logoShape ?? 'square') === opt.value
                            ? 'bg-primary text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        )}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Slider */}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-sm">Size</Label>
                    <span className="text-sm text-slate-400">{style.logoSize || 20}%</span>
                  </div>
                  <Slider
                    value={[style.logoSize || 20]}
                    onValueChange={([value]) => onStyleChange({ ...style, logoSize: value })}
                    min={10}
                    max={35}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>10%</span>
                    <span>35%</span>
                  </div>
                </div>

                {/* Margin Slider */}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-sm">Margin</Label>
                    <span className="text-sm text-slate-400">{style.logoMargin ?? 4}px</span>
                  </div>
                  <Slider
                    value={[style.logoMargin ?? 4]}
                    onValueChange={([value]) => onStyleChange({ ...style, logoMargin: value })}
                    min={0}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>0px</span>
                    <span>20px</span>
                  </div>
                </div>

                {/* Background Toggle + Color */}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white text-sm">Background</Label>
                    <button
                      onClick={() => {
                        const bg = style.logoBackground ?? { enabled: false, color: '#ffffff' };
                        onStyleChange({ ...style, logoBackground: { ...bg, enabled: !bg.enabled } });
                      }}
                      className={cn(
                        'relative w-9 h-5 rounded-full transition-colors',
                        style.logoBackground?.enabled ? 'bg-primary' : 'bg-slate-600'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                          style.logoBackground?.enabled ? 'translate-x-4' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                  {style.logoBackground?.enabled && (
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={style.logoBackground.color}
                        onChange={(e) => onStyleChange({
                          ...style,
                          logoBackground: { enabled: true, color: e.target.value },
                        })}
                        className="w-10 h-8 p-0.5 bg-slate-800 border-slate-700"
                      />
                      <Input
                        type="text"
                        value={style.logoBackground.color}
                        onChange={(e) => onStyleChange({
                          ...style,
                          logoBackground: { enabled: true, color: e.target.value },
                        })}
                        className="flex-1 h-8 text-xs bg-slate-800 border-slate-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-semibold text-white mb-2">Brand Your QR Codes</h4>
            <p className="text-sm text-slate-400 mb-4">
              Add your logo to increase recognition and trust with your audience.
            </p>
            <Link href="/plans">
              <Button className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Best Practices - visible to all users */}
      <LogoBestPractices />
    </div>
  );
}
