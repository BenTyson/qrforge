'use client';

import { Crown, Frame } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FrameOptions } from '@/lib/qr/types';

interface FrameEditorProps {
  value: FrameOptions | undefined;
  onChange: (frame: FrameOptions | undefined) => void;
  canAccessPro: boolean;
}

const DEFAULT_FRAME: FrameOptions = {
  enabled: true,
  thickness: 20,
  color: '#0f172a',
  radius: '10%',
  text: {
    bottom: 'SCAN ME',
  },
  textStyle: {
    fontColor: '#ffffff',
    fontSize: 14,
  },
};

export function FrameEditor({
  value,
  onChange,
  canAccessPro,
}: FrameEditorProps) {
  const frame = value || { ...DEFAULT_FRAME, enabled: false };
  const isEnabled = frame.enabled;

  const updateFrame = (updates: Partial<FrameOptions>) => {
    onChange({
      ...frame,
      ...updates,
    });
  };

  const toggleFrame = (enabled: boolean) => {
    if (enabled) {
      onChange({
        ...DEFAULT_FRAME,
        enabled: true,
      });
    } else {
      onChange(undefined);
    }
  };

  // If user doesn't have Pro access, show upgrade prompt
  if (!canAccessPro) {
    return (
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Frame className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">Decorative Frame</span>
          </div>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
            Pro
          </Badge>
        </div>

        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
            <Frame className="w-8 h-8 text-primary" />
          </div>
          <h4 className="font-semibold text-white mb-2">Add Custom Frames</h4>
          <p className="text-sm text-slate-400 mb-4">
            Add decorative borders with custom text like &quot;SCAN ME&quot; to make your QR codes stand out.
          </p>
          <Link href="/plans">
            <Button className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Frame Toggle */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Frame className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">Add Frame</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
              Pro
            </Badge>
          </div>
          <button
            onClick={() => toggleFrame(!isEnabled)}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors',
              isEnabled ? 'bg-primary' : 'bg-slate-600'
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Frame Options (shown when enabled) */}
        {isEnabled && (
          <div className="space-y-4 pt-4 mt-4 border-t border-slate-700">
            {/* Thickness Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white text-sm">Thickness</Label>
                <span className="text-sm text-slate-400">{frame.thickness || 20}px</span>
              </div>
              <Slider
                value={[frame.thickness || 20]}
                onValueChange={([val]) => updateFrame({ thickness: val })}
                min={10}
                max={50}
                step={2}
                className="w-full"
              />
            </div>

            {/* Corner Radius Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white text-sm">Corner Radius</Label>
                <span className="text-sm text-slate-400">{frame.radius || '10%'}</span>
              </div>
              <Slider
                value={[parseInt(frame.radius || '10')]}
                onValueChange={([val]) => updateFrame({ radius: `${val}%` })}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
            </div>

            {/* Frame Color */}
            <div>
              <Label className="text-white text-sm mb-2 block">Frame Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={frame.color || '#0f172a'}
                  onChange={(e) => updateFrame({ color: e.target.value })}
                  className="w-12 h-10 p-1 bg-slate-800 border-slate-700 cursor-pointer"
                />
                <Input
                  type="text"
                  value={frame.color || '#0f172a'}
                  onChange={(e) => updateFrame({ color: e.target.value })}
                  className="flex-1 bg-slate-800 border-slate-700"
                  placeholder="#0f172a"
                />
              </div>
            </div>

            {/* Text Options */}
            <div className="space-y-3">
              <Label className="text-white text-sm block">Frame Text</Label>

              {/* Top Text */}
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">Top Text</Label>
                <Input
                  type="text"
                  value={frame.text?.top || ''}
                  onChange={(e) =>
                    updateFrame({
                      text: { ...frame.text, top: e.target.value || undefined },
                    })
                  }
                  placeholder="Optional top text"
                  className="bg-slate-800 border-slate-700"
                  maxLength={30}
                />
              </div>

              {/* Bottom Text */}
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">Bottom Text</Label>
                <Input
                  type="text"
                  value={frame.text?.bottom || ''}
                  onChange={(e) =>
                    updateFrame({
                      text: { ...frame.text, bottom: e.target.value || undefined },
                    })
                  }
                  placeholder="e.g., SCAN ME"
                  className="bg-slate-800 border-slate-700"
                  maxLength={30}
                />
              </div>

              {/* Text Color */}
              {(frame.text?.top || frame.text?.bottom) && (
                <div>
                  <Label className="text-xs text-slate-400 mb-1 block">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={frame.textStyle?.fontColor || '#ffffff'}
                      onChange={(e) =>
                        updateFrame({
                          textStyle: { ...frame.textStyle, fontColor: e.target.value, fontSize: frame.textStyle?.fontSize || 14 },
                        })
                      }
                      className="w-10 h-8 p-0.5 bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={frame.textStyle?.fontColor || '#ffffff'}
                      onChange={(e) =>
                        updateFrame({
                          textStyle: { ...frame.textStyle, fontColor: e.target.value, fontSize: frame.textStyle?.fontSize || 14 },
                        })
                      }
                      className="flex-1 h-8 text-xs bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Text Size */}
              {(frame.text?.top || frame.text?.bottom) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-slate-400">Text Size</Label>
                    <span className="text-xs text-slate-400">{frame.textStyle?.fontSize || 14}px</span>
                  </div>
                  <Slider
                    value={[frame.textStyle?.fontSize || 14]}
                    onValueChange={([val]) =>
                      updateFrame({
                        textStyle: { ...frame.textStyle, fontSize: val, fontColor: frame.textStyle?.fontColor || '#ffffff' },
                      })
                    }
                    min={10}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
