'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface ColorPreset {
  name: string;
  foreground: string;
  background: string;
}

const PRESETS: ColorPreset[] = [
  { name: 'Classic', foreground: '#000000', background: '#FFFFFF' },
  { name: 'Navy', foreground: '#1e3a5f', background: '#FFFFFF' },
  { name: 'Forest', foreground: '#1a472a', background: '#FFFFFF' },
  { name: 'Burgundy', foreground: '#722f37', background: '#FFFFFF' },
  { name: 'Charcoal', foreground: '#36454f', background: '#f5f5f5' },
  { name: 'Ocean', foreground: '#003366', background: '#e6f3ff' },
];

// Calculate relative luminance per WCAG 2.1
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio per WCAG 2.1
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

type ContrastLevel = 'excellent' | 'good' | 'poor' | 'fail';

function getContrastLevel(ratio: number): ContrastLevel {
  if (ratio >= 7) return 'excellent';
  if (ratio >= 4.5) return 'good';
  if (ratio >= 3) return 'poor';
  return 'fail';
}

function getContrastInfo(level: ContrastLevel): {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
} {
  switch (level) {
    case 'excellent':
      return {
        label: 'Excellent',
        description: 'Perfect contrast for all scanning conditions',
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
      };
    case 'good':
      return {
        label: 'Good',
        description: 'Sufficient contrast for most conditions',
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'text-primary',
        bgColor: 'bg-primary/20',
      };
    case 'poor':
      return {
        label: 'Poor',
        description: 'May have scanning issues in low light',
        icon: <AlertTriangle className="w-6 h-6" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
      };
    case 'fail':
      return {
        label: 'Fail',
        description: 'Will likely fail to scan - increase contrast',
        icon: <XCircle className="w-6 h-6" />,
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
      };
  }
}

// Simple QR-like pattern for preview
function QRPreview({ foreground, background }: { foreground: string; background: string }) {
  // Generate a fixed pattern that looks like a QR code
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,1,1,0,1,0,1,1,0,1,0,1,0,1],
    [0,1,0,1,0,0,0,1,1,0,1,0,0,1,0,1,0,1,0],
    [1,0,1,1,0,1,1,0,0,1,1,1,0,0,1,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,1,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,0,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,1,1,0,1,1,0,0],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,0,1,0,0,1,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1],
  ];

  return (
    <div
      className="w-full aspect-square rounded-lg overflow-hidden"
      style={{ backgroundColor: background }}
    >
      <svg viewBox="0 0 19 19" className="w-full h-full">
        {pattern.map((row, y) =>
          row.map((cell, x) =>
            cell === 1 ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={foreground}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

export function ContrastChecker() {
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#FFFFFF');

  const { ratio, level, info } = useMemo(() => {
    const r = getContrastRatio(foreground, background);
    const l = getContrastLevel(r);
    const i = getContrastInfo(l);
    return { ratio: r, level: l, info: i };
  }, [foreground, background]);

  const applyPreset = (preset: ColorPreset) => {
    setForeground(preset.foreground);
    setBackground(preset.background);
  };

  const ctaUrl = `/qr-codes/new?fg=${encodeURIComponent(foreground)}&bg=${encodeURIComponent(background)}`;

  return (
    <div className="space-y-6">
      {/* Color Pickers Card */}
      <Card
        className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up"
        style={{ animationDelay: '80ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Choose Your Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foreground Color */}
            <div className="space-y-3">
              <Label htmlFor="foreground" className="text-base font-medium">
                Foreground (Dark Modules)
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    id="foreground"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-600 bg-transparent"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={foreground.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                        setForeground(val);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-sm font-mono"
                    placeholder="#000000"
                  />
                  <p className="text-xs text-slate-500 mt-1">The dark squares in your QR code</p>
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-3">
              <Label htmlFor="background" className="text-base font-medium">
                Background (Light Modules)
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    id="background"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-600 bg-transparent"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={background.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                        setBackground(val);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-sm font-mono"
                    placeholder="#FFFFFF"
                  />
                  <p className="text-xs text-slate-500 mt-1">The light squares in your QR code</p>
                </div>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="pt-4 border-t border-slate-700/50">
            <Label className="text-sm font-medium text-slate-400 mb-3 block">
              High-Contrast Presets
            </Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-sm"
                >
                  <div className="flex gap-0.5">
                    <div
                      className="w-4 h-4 rounded-sm border border-slate-500"
                      style={{ backgroundColor: preset.foreground }}
                    />
                    <div
                      className="w-4 h-4 rounded-sm border border-slate-500"
                      style={{ backgroundColor: preset.background }}
                    />
                  </div>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contrast Result Card */}
        <Card
          className={`bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up ${
            level === 'excellent' || level === 'good' ? 'border-primary/30' : ''
          } ${level === 'fail' ? 'border-red-500/30' : ''}`}
          style={{ animationDelay: '160ms' }}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-full ${info.bgColor} flex items-center justify-center flex-shrink-0 ${info.color}`}>
                {info.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-lg font-semibold ${info.color}`}>{info.label}</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {ratio.toFixed(2)}
                  <span className="text-lg text-slate-400 ml-1">: 1</span>
                </p>
                <p className="text-sm text-slate-400">{info.description}</p>
              </div>
            </div>

            {/* Contrast Scale */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>1:1</span>
                <span>4.5:1</span>
                <span>7:1</span>
                <span>21:1</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    level === 'fail' ? 'bg-red-500' :
                    level === 'poor' ? 'bg-yellow-500' :
                    level === 'good' ? 'bg-primary' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((ratio / 21) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-red-400">Fail</span>
                <span className="text-yellow-400">Poor</span>
                <span className="text-primary">Good</span>
                <span className="text-green-400">Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Preview Card */}
        <Card
          className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up"
          style={{ animationDelay: '240ms' }}
        >
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-400 mb-3">Live Preview</p>
            <div className="w-full max-w-[200px] mx-auto">
              <QRPreview foreground={foreground} background={background} />
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">
              This is how your QR code colors will appear
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Info */}
      <Card
        className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up"
        style={{ animationDelay: '320ms' }}
      >
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">QR Code Contrast Requirements</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">7:1 or higher</strong> - Excellent. Works in all conditions including low light and at angles.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">4.5:1 to 7:1</strong> - Good. Reliable scanning in normal conditions.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">3:1 to 4.5:1</strong> - Poor. May fail in suboptimal lighting or on certain devices.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Below 3:1</strong> - Fail. Will likely not scan. Choose different colors.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div
        className="text-center pt-4 animate-slide-up"
        style={{ animationDelay: '400ms' }}
      >
        <p className="text-slate-400 mb-4">
          Ready to create a QR code with these colors?
        </p>
        <Link href={ctaUrl}>
          <Button size="lg" className="glow-hover group">
            Create QR Code with These Colors
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
