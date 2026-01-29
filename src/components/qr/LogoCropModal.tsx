'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Square, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getCroppedImage, createImageUrl } from '@/lib/qr/cropUtils';
import type { LogoShape } from '@/lib/qr/types';

interface LogoCropModalProps {
  file: File | null;
  open: boolean;
  onClose: () => void;
  onApply: (blob: Blob, shape: LogoShape, background: { enabled: boolean; color: string }) => void;
  initialShape?: LogoShape;
  initialBackground?: { enabled: boolean; color: string };
}

export function LogoCropModal({
  file,
  open,
  onClose,
  onApply,
  initialShape = 'square',
  initialBackground,
}: LogoCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [shape, setShape] = useState<LogoShape>(initialShape);
  const [bgEnabled, setBgEnabled] = useState(initialBackground?.enabled ?? false);
  const [bgColor, setBgColor] = useState(initialBackground?.color ?? '#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image URL when file changes
  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }
    let revoke: string | null = null;
    createImageUrl(file).then((url) => {
      // Only set if it's an object URL (not a data URL)
      if (url.startsWith('blob:')) revoke = url;
      setImageUrl(url);
    });
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [file]);

  // Reset state when modal opens with new initial values
  useEffect(() => {
    if (open) {
      setShape(initialShape);
      setBgEnabled(initialBackground?.enabled ?? false);
      setBgColor(initialBackground?.color ?? '#ffffff');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [open, initialShape, initialBackground]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const background = { enabled: bgEnabled, color: bgColor };
      const blob = await getCroppedImage(imageUrl, croppedAreaPixels, shape, background);
      onApply(blob, shape, background);
    } catch {
      // Silently fail — user can retry
    } finally {
      setIsProcessing(false);
    }
  };

  const cropShape = shape === 'circle' ? 'round' : 'rect';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100%-1rem)] bg-slate-900 border-slate-700 p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-white">Crop Logo</DialogTitle>
        </DialogHeader>

        {imageUrl ? (
          <div className="space-y-4 p-4">
            {/* Cropper Area */}
            <div className="relative w-full aspect-square bg-slate-950 rounded-lg overflow-hidden">
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape={cropShape}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={shape !== 'circle'}
              />
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-400">Zoom</Label>
                <span className="text-xs text-slate-500">{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                min={1}
                max={3}
                step={0.1}
              />
            </div>

            {/* Shape Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Shape</Label>
              <div className="flex gap-2">
                {([
                  { value: 'square' as const, icon: <Square className="w-4 h-4" />, label: 'Square' },
                  { value: 'rounded' as const, icon: <RoundedSquareIcon />, label: 'Rounded' },
                  { value: 'circle' as const, icon: <Circle className="w-4 h-4" />, label: 'Circle' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setShape(opt.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      shape === opt.value
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

            {/* Background Toggle + Color */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-400">Background Fill</Label>
                <button
                  onClick={() => setBgEnabled(!bgEnabled)}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors',
                    bgEnabled ? 'bg-primary' : 'bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                      bgEnabled ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
              {bgEnabled && (
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-8 p-0.5 bg-slate-800 border-slate-700"
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 h-8 text-xs bg-slate-800 border-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading image...
          </div>
        )}

        <DialogFooter className="p-4 pt-0">
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isProcessing || !imageUrl}>
            {isProcessing ? 'Processing...' : 'Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoundedSquareIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    </svg>
  );
}
