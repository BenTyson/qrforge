'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Crown, Palette, Grid3X3, Frame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LogoUploader } from '@/components/qr/LogoUploader';
import { LogoBestPractices } from '@/components/qr/LogoBestPractices';
import { PatternSelector } from '@/components/qr/PatternSelector';
import { EyeStyleSelector } from '@/components/qr/EyeStyleSelector';
import { FrameEditor } from '@/components/qr/FrameEditor';
import { ContrastIndicator } from '@/components/qr/ContrastIndicator';
import { COLOR_PRESETS } from '../constants';
import type { QRStyleOptions } from '@/lib/qr/types';

interface StyleStepProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  onContinue: () => void;
  canAccessProTypes: boolean;
}

type TabType = 'pattern' | 'colors' | 'logo' | 'frame';

export function StyleStep({
  style,
  onStyleChange,
  onContinue,
  canAccessProTypes,
}: StyleStepProps) {
  const [activeTab, setActiveTab] = useState<TabType>('colors');

  const tabs: { id: TabType; label: string; icon: React.ReactNode; proBadge?: boolean; indicator?: boolean }[] = [
    { id: 'colors', label: 'Colors', icon: <Palette className="w-5 h-5" /> },
    { id: 'pattern', label: 'Pattern', icon: <Grid3X3 className="w-5 h-5" />, proBadge: true },
    { id: 'frame', label: 'Frame', icon: <Frame className="w-5 h-5" />, proBadge: true, indicator: style.frame?.enabled },
    { id: 'logo', label: 'Logo', icon: <ImageIcon className="w-5 h-5" />, proBadge: true, indicator: !!style.logoUrl },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Prominent Tab Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all relative",
              activeTab === tab.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
            )}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.label}</span>
            {tab.proBadge && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
                Pro
              </Badge>
            )}
            {tab.indicator && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content - Full Width */}
      <div className="min-h-[400px]">
        {activeTab === 'colors' && (
          <ColorsTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
        {activeTab === 'pattern' && (
          <PatternTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
        {activeTab === 'frame' && (
          <FrameTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
        {activeTab === 'logo' && (
          <LogoTabContent
            style={style}
            onStyleChange={onStyleChange}
            canAccessProTypes={canAccessProTypes}
          />
        )}
      </div>

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full mt-6" size="lg">
        Continue to Options
        <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}

// Pattern Tab Content
interface PatternTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  canAccessProTypes: boolean;
}

function PatternTabContent({ style, onStyleChange, canAccessProTypes }: PatternTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Module Pattern */}
      <PatternSelector
        value={style.moduleShape}
        onChange={(shape) => onStyleChange({ ...style, moduleShape: shape })}
        canAccessPro={canAccessProTypes}
      />

      {/* Eye Style */}
      <EyeStyleSelector
        cornerSquareValue={style.cornerSquareShape}
        cornerDotValue={style.cornerDotShape}
        onCornerSquareChange={(shape) => onStyleChange({ ...style, cornerSquareShape: shape })}
        onCornerDotChange={(shape) => onStyleChange({ ...style, cornerDotShape: shape })}
        canAccessPro={canAccessProTypes}
      />
    </div>
  );
}

// Gradient presets with recommended background colors for good contrast
const GRADIENT_PRESETS = [
  { name: 'Sunset', start: '#f97316', end: '#ec4899', type: 'linear' as const, angle: 45, bg: '#0f172a' },
  { name: 'Ocean', start: '#06b6d4', end: '#3b82f6', type: 'linear' as const, angle: 135, bg: '#0f172a' },
  { name: 'Forest', start: '#22c55e', end: '#14b8a6', type: 'linear' as const, angle: 90, bg: '#0f172a' },
  { name: 'Royal', start: '#8b5cf6', end: '#ec4899', type: 'linear' as const, angle: 45, bg: '#0f172a' },
  { name: 'Fire', start: '#ef4444', end: '#f97316', type: 'radial' as const, bg: '#0f172a' },
  { name: 'Sky', start: '#0ea5e9', end: '#6366f1', type: 'radial' as const, bg: '#0f172a' },
];

// Colors Tab Content
interface ColorsTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  canAccessProTypes: boolean;
}

function ColorsTabContent({ style, onStyleChange, canAccessProTypes }: ColorsTabContentProps) {
  const gradientEnabled = style.gradient?.enabled || false;

  const toggleGradient = (enabled: boolean) => {
    if (!canAccessProTypes) return;
    if (enabled) {
      onStyleChange({
        ...style,
        backgroundColor: '#0f172a', // Dark background for better gradient contrast
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
        backgroundColor: '#ffffff', // Reset to white when disabling gradient
        gradient: undefined,
      });
    }
  };

  const applyGradientPreset = (preset: typeof GRADIENT_PRESETS[0]) => {
    if (!canAccessProTypes) return;
    onStyleChange({
      ...style,
      backgroundColor: preset.bg, // Set matching background for good contrast
      gradient: {
        enabled: true,
        type: preset.type,
        startColor: preset.start,
        endColor: preset.end,
        angle: preset.angle,
      },
    });
  };

  // Show gradient preview values (either actual or demo values)
  const previewGradient = style.gradient || {
    enabled: true,
    type: 'linear' as const,
    startColor: '#06b6d4',
    endColor: '#3b82f6',
    angle: 135,
  };

  return (
    <div className="space-y-6">
      {/* Gradient Section - Always visible */}
      <div className={cn(
        "p-4 rounded-xl border relative",
        canAccessProTypes
          ? "bg-slate-800/50 border-slate-700"
          : "bg-slate-800/30 border-slate-700/50"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              canAccessProTypes ? "text-white" : "text-slate-400"
            )}>Gradient Colors</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">
              Pro
            </Badge>
          </div>
          <button
            onClick={() => toggleGradient(!gradientEnabled)}
            disabled={!canAccessProTypes}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors',
              !canAccessProTypes && 'opacity-50 cursor-not-allowed',
              gradientEnabled ? 'bg-primary' : 'bg-slate-600'
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                gradientEnabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Show gradient options only when enabled (or show preview for non-pro users) */}
        {(gradientEnabled || !canAccessProTypes) && (
        <div className={cn(
          "space-y-4 pt-3 border-t border-slate-700",
          !canAccessProTypes && "opacity-50 pointer-events-none"
        )}>
          {/* Gradient Presets */}
          <div className="grid grid-cols-6 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyGradientPreset(preset)}
                disabled={!canAccessProTypes}
                className={cn(
                  'aspect-square rounded-lg border-2 transition-all overflow-hidden',
                  canAccessProTypes && style.gradient?.startColor === preset.start && style.gradient?.endColor === preset.end
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

          {/* Tip about dark backgrounds */}
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            Dark backgrounds work best with colorful gradients for scannability
          </p>

          {/* Custom Gradient Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Start Color</Label>
              <div className="flex gap-1 mt-1">
                <Input
                  type="color"
                  value={style.gradient?.startColor ?? previewGradient.startColor}
                  onChange={(e) => canAccessProTypes && onStyleChange({
                    ...style,
                    gradient: { ...previewGradient, ...style.gradient, startColor: e.target.value },
                  })}
                  disabled={!canAccessProTypes}
                  className="w-10 h-8 p-0.5 bg-slate-800 border-slate-700 disabled:opacity-50"
                />
                <Input
                  type="text"
                  value={style.gradient?.startColor ?? previewGradient.startColor}
                  onChange={(e) => canAccessProTypes && onStyleChange({
                    ...style,
                    gradient: { ...previewGradient, ...style.gradient, startColor: e.target.value },
                  })}
                  disabled={!canAccessProTypes}
                  className="flex-1 h-8 text-xs bg-slate-800 border-slate-700 disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-400">End Color</Label>
              <div className="flex gap-1 mt-1">
                <Input
                  type="color"
                  value={style.gradient?.endColor ?? previewGradient.endColor}
                  onChange={(e) => canAccessProTypes && onStyleChange({
                    ...style,
                    gradient: { ...previewGradient, ...style.gradient, endColor: e.target.value },
                  })}
                  disabled={!canAccessProTypes}
                  className="w-10 h-8 p-0.5 bg-slate-800 border-slate-700 disabled:opacity-50"
                />
                <Input
                  type="text"
                  value={style.gradient?.endColor ?? previewGradient.endColor}
                  onChange={(e) => canAccessProTypes && onStyleChange({
                    ...style,
                    gradient: { ...previewGradient, ...style.gradient, endColor: e.target.value },
                  })}
                  disabled={!canAccessProTypes}
                  className="flex-1 h-8 text-xs bg-slate-800 border-slate-700 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Gradient Type & Angle */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button
                onClick={() => canAccessProTypes && onStyleChange({
                  ...style,
                  gradient: { ...previewGradient, ...style.gradient, type: 'linear' },
                })}
                disabled={!canAccessProTypes}
                className={cn(
                  'px-3 py-1 text-xs rounded-l-md transition-colors',
                  (style.gradient?.type ?? previewGradient.type) === 'linear'
                    ? 'bg-primary text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                )}
              >
                Linear
              </button>
              <button
                onClick={() => canAccessProTypes && onStyleChange({
                  ...style,
                  gradient: { ...previewGradient, ...style.gradient, type: 'radial' },
                })}
                disabled={!canAccessProTypes}
                className={cn(
                  'px-3 py-1 text-xs rounded-r-md transition-colors',
                  (style.gradient?.type ?? previewGradient.type) === 'radial'
                    ? 'bg-primary text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                )}
              >
                Radial
              </button>
            </div>

            {(style.gradient?.type ?? previewGradient.type) === 'linear' && (
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-xs text-slate-400 shrink-0">Angle</Label>
                <Slider
                  value={[style.gradient?.angle ?? previewGradient.angle ?? 0]}
                  onValueChange={([value]) => canAccessProTypes && onStyleChange({
                    ...style,
                    gradient: { ...previewGradient, ...style.gradient, angle: value },
                  })}
                  disabled={!canAccessProTypes}
                  min={0}
                  max={360}
                  step={15}
                  className="flex-1"
                />
                <span className="text-xs text-slate-400 w-8">{style.gradient?.angle ?? previewGradient.angle ?? 0}°</span>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Upgrade overlay for non-pro users */}
        {!canAccessProTypes && (
          <div className="absolute inset-0 flex items-end justify-center rounded-xl bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent">
            <Link href="/plans" className="mb-4">
              <Button size="sm" className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90">
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                Upgrade to Unlock
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Background Color - always visible regardless of gradient mode */}
      <div className="space-y-2">
        <Label className="text-white">Background Color</Label>
        <div className="flex gap-2">
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

          {/* Custom QR Color (foreground only - background is shown above) */}
          <div className="space-y-2">
            <Label className="text-white">QR Color</Label>
            <div className="flex gap-2">
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
        </>
      )}

      {/* Contrast Indicator - always visible */}
      <ContrastIndicator
        foreground={gradientEnabled ? (style.gradient?.startColor || style.foregroundColor) : style.foregroundColor}
        background={style.backgroundColor}
        gradientEndColor={gradientEnabled ? style.gradient?.endColor : undefined}
      />
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

// Frame Tab Content
interface FrameTabContentProps {
  style: QRStyleOptions;
  onStyleChange: (style: QRStyleOptions) => void;
  canAccessProTypes: boolean;
}

function FrameTabContent({ style, onStyleChange, canAccessProTypes }: FrameTabContentProps) {
  return (
    <FrameEditor
      value={style.frame}
      onChange={(frame) => onStyleChange({ ...style, frame })}
      canAccessPro={canAccessProTypes}
    />
  );
}
