'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { QRStyleOptions } from '@/lib/qr/types';
import { cn } from '@/lib/utils';

interface QRStyleEditorProps {
  style: QRStyleOptions;
  onChange: (style: QRStyleOptions) => void;
}

const PRESET_COLORS = [
  { fg: '#000000', bg: '#ffffff', name: 'Classic' },
  { fg: '#1e3a5f', bg: '#ffffff', name: 'Navy' },
  { fg: '#14b8a6', bg: '#ffffff', name: 'Teal' },
  { fg: '#06b6d4', bg: '#ffffff', name: 'Cyan' },
  { fg: '#059669', bg: '#ffffff', name: 'Emerald' },
  { fg: '#dc2626', bg: '#ffffff', name: 'Red' },
  { fg: '#000000', bg: '#fef3c7', name: 'Cream' },
  { fg: '#ffffff', bg: '#000000', name: 'Inverted' },
];

export function QRStyleEditor({ style, onChange }: QRStyleEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateStyle = (updates: Partial<QRStyleOptions>) => {
    onChange({ ...style, ...updates });
  };

  return (
    <Card className="overflow-hidden glass">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="font-medium">Customize Style</span>
        </div>
        <svg
          className={cn(
            'w-5 h-5 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-6 space-y-6">
          {/* Color Presets */}
          <div>
            <Label className="mb-3 block">Color Presets</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = style.foregroundColor === preset.fg && style.backgroundColor === preset.bg;
                return (
                  <button
                    key={preset.name}
                    onClick={() => updateStyle({
                      foregroundColor: preset.fg,
                      backgroundColor: preset.bg,
                    })}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2 rounded-full transition-all',
                      'border',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
                    )}
                  >
                    {/* Split color swatch */}
                    <div className="relative w-5 h-5 rounded-full overflow-hidden shadow-sm ring-1 ring-black/10">
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: preset.bg }}
                      />
                      <div
                        className="absolute top-0 left-0 w-1/2 h-full"
                        style={{ backgroundColor: preset.fg }}
                      />
                    </div>
                    <span className={cn(
                      'text-sm transition-colors',
                      isSelected ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-foreground'
                    )}>
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fgColor" className="mb-2 block">QR Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="fgColor"
                  value={style.foregroundColor}
                  onChange={(e) => updateStyle({ foregroundColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={style.foregroundColor}
                  onChange={(e) => updateStyle({ foregroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-md bg-secondary/50 border border-input text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bgColor" className="mb-2 block">Background</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="bgColor"
                  value={style.backgroundColor}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={style.backgroundColor}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-md bg-secondary/50 border border-input text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Error Correction Level */}
          <div>
            <Label className="mb-3 block">Durability</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { level: 'L' as const, name: 'Basic', desc: 'Screens & digital use' },
                { level: 'M' as const, name: 'Standard', desc: 'General print use', recommended: true },
                { level: 'Q' as const, name: 'Enhanced', desc: 'Logos & busy designs' },
                { level: 'H' as const, name: 'Maximum', desc: 'Outdoor & rough conditions' },
              ]).map((option) => (
                <button
                  key={option.level}
                  onClick={() => updateStyle({ errorCorrectionLevel: option.level })}
                  className={cn(
                    'relative flex items-start gap-3 p-3 rounded-lg text-left transition-all',
                    'border',
                    style.errorCorrectionLevel === option.level
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    style.errorCorrectionLevel === option.level ? 'bg-primary' : 'bg-muted-foreground/30'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-medium',
                        style.errorCorrectionLevel === option.level ? 'text-primary' : 'text-foreground'
                      )}>
                        {option.name}
                      </span>
                      {option.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{option.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Margin */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Border Space</Label>
              <span className="text-sm text-muted-foreground">
                {style.margin === 0 ? 'None' : style.margin <= 2 ? 'Tight' : style.margin <= 4 ? 'Normal' : 'Wide'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Empty space around the QR code helps scanners read it reliably
            </p>
            <Slider
              value={[style.margin]}
              onValueChange={([value]) => updateStyle({ margin: value })}
              min={0}
              max={6}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
