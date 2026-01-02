'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QRPreview } from '@/components/qr/QRPreview';
import { LogoUploader } from '@/components/qr/LogoUploader';
import { LogoBestPractices } from '@/components/qr/LogoBestPractices';
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
  const [activeTab, setActiveTab] = useState<'colors' | 'logo'>('colors');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preview */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs aspect-square">
            <QRPreview content={content} style={style} className="w-full h-full" />
          </div>

          {/* Logo link under preview */}
          <button
            onClick={() => setActiveTab('logo')}
            className={cn(
              "mt-4 text-xs flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
              style.logoUrl
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-slate-400 hover:text-primary hover:bg-slate-800"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {style.logoUrl ? (
              <span>Logo applied ({style.logoSize || 20}%)</span>
            ) : (
              <span>Add a logo</span>
            )}
            {!style.logoUrl && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-primary/20 text-primary border-0">
                Pro
              </Badge>
            )}
          </button>
        </div>

        {/* Style Options with Tabs */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('colors')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors relative",
                activeTab === 'colors'
                  ? "text-primary"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Colors
              {activeTab === 'colors' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2",
                activeTab === 'logo'
                  ? "text-primary"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Logo
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
                Pro
              </Badge>
              {style.logoUrl && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
              {activeTab === 'logo' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'colors' ? (
            <ColorsTabContent
              style={style}
              onStyleChange={onStyleChange}
            />
          ) : (
            <LogoTabContent
              style={style}
              onStyleChange={onStyleChange}
              canAccessProTypes={canAccessProTypes}
            />
          )}

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

// Gradient presets
const GRADIENT_PRESETS = [
  { name: 'Sunset', start: '#f97316', end: '#ec4899', type: 'linear' as const, angle: 45 },
  { name: 'Ocean', start: '#06b6d4', end: '#3b82f6', type: 'linear' as const, angle: 135 },
  { name: 'Forest', start: '#22c55e', end: '#14b8a6', type: 'linear' as const, angle: 90 },
  { name: 'Royal', start: '#8b5cf6', end: '#ec4899', type: 'linear' as const, angle: 45 },
  { name: 'Fire', start: '#ef4444', end: '#f97316', type: 'radial' as const },
  { name: 'Sky', start: '#0ea5e9', end: '#6366f1', type: 'radial' as const },
];

// Colors Tab Content
interface ColorsTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
}

function ColorsTabContent({ style, onStyleChange }: ColorsTabContentProps) {
  const gradientEnabled = style.gradient?.enabled || false;

  const toggleGradient = (enabled: boolean) => {
    if (enabled) {
      onStyleChange({
        ...style,
        gradient: {
          enabled: true,
          type: 'linear',
          startColor: '#06b6d4',
          endColor: '#3b82f6',
          angle: 135,
        },
      });
    } else {
      onStyleChange({
        ...style,
        gradient: undefined,
      });
    }
  };

  const applyGradientPreset = (preset: typeof GRADIENT_PRESETS[0]) => {
    onStyleChange({
      ...style,
      gradient: {
        enabled: true,
        type: preset.type,
        startColor: preset.start,
        endColor: preset.end,
        angle: preset.angle,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Gradient Toggle */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Gradient Colors</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
              Pro
            </Badge>
          </div>
          <button
            onClick={() => toggleGradient(!gradientEnabled)}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors',
              gradientEnabled ? 'bg-primary' : 'bg-slate-600'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                gradientEnabled ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>

        {gradientEnabled && style.gradient && (
          <div className="space-y-4 pt-3 border-t border-slate-700">
            {/* Gradient Presets */}
            <div className="grid grid-cols-6 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyGradientPreset(preset)}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all overflow-hidden',
                    style.gradient?.startColor === preset.start && style.gradient?.endColor === preset.end
                      ? 'border-primary scale-105'
                      : 'border-transparent hover:border-slate-600'
                  )}
                  title={preset.name}
                  style={{
                    background: preset.type === 'radial'
                      ? `radial-gradient(circle, ${preset.start}, ${preset.end})`
                      : `linear-gradient(${preset.angle}deg, ${preset.start}, ${preset.end})`,
                  }}
                />
              ))}
            </div>

            {/* Custom Gradient Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Start Color</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="color"
                    value={style.gradient.startColor}
                    onChange={(e) => onStyleChange({
                      ...style,
                      gradient: { ...style.gradient!, startColor: e.target.value },
                    })}
                    className="w-10 h-8 p-0.5 bg-slate-800 border-slate-700"
                  />
                  <Input
                    type="text"
                    value={style.gradient.startColor}
                    onChange={(e) => onStyleChange({
                      ...style,
                      gradient: { ...style.gradient!, startColor: e.target.value },
                    })}
                    className="flex-1 h-8 text-xs bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-400">End Color</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="color"
                    value={style.gradient.endColor}
                    onChange={(e) => onStyleChange({
                      ...style,
                      gradient: { ...style.gradient!, endColor: e.target.value },
                    })}
                    className="w-10 h-8 p-0.5 bg-slate-800 border-slate-700"
                  />
                  <Input
                    type="text"
                    value={style.gradient.endColor}
                    onChange={(e) => onStyleChange({
                      ...style,
                      gradient: { ...style.gradient!, endColor: e.target.value },
                    })}
                    className="flex-1 h-8 text-xs bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Gradient Type & Angle */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <button
                  onClick={() => onStyleChange({
                    ...style,
                    gradient: { ...style.gradient!, type: 'linear' },
                  })}
                  className={cn(
                    'px-3 py-1 text-xs rounded-l-md transition-colors',
                    style.gradient.type === 'linear'
                      ? 'bg-primary text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  )}
                >
                  Linear
                </button>
                <button
                  onClick={() => onStyleChange({
                    ...style,
                    gradient: { ...style.gradient!, type: 'radial' },
                  })}
                  className={cn(
                    'px-3 py-1 text-xs rounded-r-md transition-colors',
                    style.gradient.type === 'radial'
                      ? 'bg-primary text-white'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  )}
                >
                  Radial
                </button>
              </div>

              {style.gradient.type === 'linear' && (
                <div className="flex items-center gap-2 flex-1">
                  <Label className="text-xs text-slate-400 shrink-0">Angle</Label>
                  <Slider
                    value={[style.gradient.angle || 0]}
                    onValueChange={([value]) => onStyleChange({
                      ...style,
                      gradient: { ...style.gradient!, angle: value },
                    })}
                    min={0}
                    max={360}
                    step={15}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-400 w-8">{style.gradient.angle || 0}°</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Color Presets & Custom Colors - only shown when gradient is off */}
      {!gradientEnabled && (
        <>
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
        </>
      )}

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
    </div>
  );
}

// Logo Tab Content
interface LogoTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  canAccessProTypes: boolean;
}

function LogoTabContent({ style, onStyleChange, canAccessProTypes }: LogoTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Add Your Logo
        </p>

        {canAccessProTypes ? (
          <div className="space-y-4">
            <LogoUploader
              value={style.logoUrl}
              onChange={(url) => onStyleChange({
                ...style,
                logoUrl: url,
                errorCorrectionLevel: url ? 'H' : style.errorCorrectionLevel
              })}
              placeholder="Drag & drop or click to upload"
            />
            <p className="text-xs text-slate-500">
              PNG, JPG, SVG &bull; Max 1MB
            </p>

            {/* Logo Size Slider - only show when logo is uploaded */}
            {style.logoUrl && (
              <div className="pt-2 border-t border-slate-700">
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
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>15% (smallest)</span>
                  <span>30% (largest)</span>
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
