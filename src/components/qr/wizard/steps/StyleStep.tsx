'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { QRPreview } from '@/components/qr/QRPreview';
import { LogoUploader } from '@/components/qr/LogoUploader';
import { COLOR_PRESETS } from '../constants';
import type { QRContent, QRStyleOptions } from '@/lib/qr/types';

interface StyleStepProps {
  content: QRContent | null;
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  onContinue: () => void;
  canAccessProTypes: boolean;
}

const DURABILITY_OPTIONS = [
  { level: 'L' as const, name: 'Basic', desc: 'Screens & digital' },
  { level: 'M' as const, name: 'Standard', desc: 'General print', recommended: true },
  { level: 'Q' as const, name: 'Enhanced', desc: 'Logos & busy designs' },
  { level: 'H' as const, name: 'Maximum', desc: 'Outdoor & rough use' },
];

export function StyleStep({
  content,
  style,
  onStyleChange,
  onContinue,
  canAccessProTypes,
}: StyleStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs aspect-square">
            <QRPreview content={content} style={style} className="w-full h-full" />
          </div>

          {/* Logo Upload - Pro feature */}
          <div className="w-full max-w-xs mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <p className="text-sm font-medium text-white mb-3">Add your logo</p>
            {canAccessProTypes ? (
              <div className="space-y-4">
                <LogoUploader
                  value={style.logoUrl}
                  onChange={(url) => onStyleChange({
                    ...style,
                    logoUrl: url,
                    errorCorrectionLevel: url ? 'H' : style.errorCorrectionLevel
                  })}
                  placeholder="Upload logo for QR center"
                />
                {/* Logo Size Slider - only show when logo is uploaded */}
                {style.logoUrl && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white text-sm">Logo Size</Label>
                      <span className="text-sm text-slate-400">{style.logoSize || 20}%</span>
                    </div>
                    <Slider
                      value={[style.logoSize || 20]}
                      onValueChange={([value]) => onStyleChange({ ...style, logoSize: value })}
                      min={15}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Larger logos may affect scannability
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Upgrade to Pro to add logos</p>
                </div>
                <Link href="/plans">
                  <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                    Pro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Style Options */}
        <div className="space-y-6">
          {/* Color Presets */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Color Presets</h4>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onStyleChange({ ...style, foregroundColor: preset.fg, backgroundColor: preset.bg })}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all overflow-hidden',
                    style.foregroundColor === preset.fg && style.backgroundColor === preset.bg
                      ? 'border-primary scale-105'
                      : 'border-transparent hover:border-slate-600'
                  )}
                  title={preset.name}
                >
                  <div className="w-full h-full" style={{ backgroundColor: preset.bg }}>
                    <div
                      className="w-1/2 h-full"
                      style={{ backgroundColor: preset.fg }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <div>
              <Label className="text-white">QR Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={style.foregroundColor}
                  onChange={(e) => onStyleChange({ ...style, foregroundColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-slate-800 border-slate-700"
                />
                <Input
                  type="text"
                  value={style.foregroundColor}
                  onChange={(e) => onStyleChange({ ...style, foregroundColor: e.target.value })}
                  className="flex-1 bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Background</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={style.backgroundColor}
                  onChange={(e) => onStyleChange({ ...style, backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-slate-800 border-slate-700"
                />
                <Input
                  type="text"
                  value={style.backgroundColor}
                  onChange={(e) => onStyleChange({ ...style, backgroundColor: e.target.value })}
                  className="flex-1 bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Durability (Error Correction Level) */}
          <div>
            <Label className="text-white mb-3 block">Durability</Label>
            <div className="grid grid-cols-2 gap-2">
              {DURABILITY_OPTIONS.map((option) => (
                <button
                  key={option.level}
                  onClick={() => onStyleChange({ ...style, errorCorrectionLevel: option.level })}
                  className={cn(
                    'flex items-start gap-2 p-3 rounded-lg text-left transition-all border',
                    style.errorCorrectionLevel === option.level
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    style.errorCorrectionLevel === option.level ? 'bg-primary' : 'bg-slate-600'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-medium',
                        style.errorCorrectionLevel === option.level ? 'text-primary' : 'text-white'
                      )}>
                        {option.name}
                      </span>
                      {option.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{option.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Border Space (Margin) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-white">Border Space</Label>
              <span className="text-sm text-slate-400">
                {style.margin === 0 ? 'None' : style.margin <= 2 ? 'Tight' : style.margin <= 4 ? 'Normal' : 'Wide'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Empty space around the QR helps scanners read it reliably
            </p>
            <Slider
              value={[style.margin]}
              onValueChange={([value]) => onStyleChange({ ...style, margin: value })}
              min={0}
              max={6}
              step={1}
              className="w-full"
            />
          </div>

          {/* Continue Button */}
          <Button onClick={onContinue} className="w-full" size="lg">
            Continue to Options
            <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
