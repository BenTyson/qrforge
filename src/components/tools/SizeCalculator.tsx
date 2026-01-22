'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Ruler, ArrowRight } from 'lucide-react';

type DistanceUnit = 'feet' | 'meters';
type OutputUnit = 'inches' | 'cm' | 'feet';
type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

const EC_DESCRIPTIONS: Record<ErrorCorrection, string> = {
  L: 'Low (~7% recovery)',
  M: 'Medium (~15% recovery)',
  Q: 'Quartile (~25% recovery)',
  H: 'High (~30% recovery)',
};

const EC_MULTIPLIERS: Record<ErrorCorrection, number> = {
  L: 1.0,
  M: 1.05,
  Q: 1.1,
  H: 1.15,
};

interface SizeReference {
  maxCm: number;
  label: string;
  emoji: string;
}

const SIZE_REFERENCES: SizeReference[] = [
  { maxCm: 2, label: 'Postage stamp', emoji: '📮' },
  { maxCm: 5, label: 'Credit card', emoji: '💳' },
  { maxCm: 10, label: 'Smartphone', emoji: '📱' },
  { maxCm: 20, label: 'Sheet of paper', emoji: '📄' },
  { maxCm: 30, label: 'Dinner plate', emoji: '🍽️' },
  { maxCm: 50, label: 'Laptop screen', emoji: '💻' },
  { maxCm: 100, label: 'Poster', emoji: '🖼️' },
  { maxCm: 200, label: 'Large banner', emoji: '🪧' },
  { maxCm: Infinity, label: 'Billboard', emoji: '🛣️' },
];

function getSizeReference(sizeCm: number): SizeReference {
  return SIZE_REFERENCES.find((ref) => sizeCm <= ref.maxCm) || SIZE_REFERENCES[SIZE_REFERENCES.length - 1];
}

export function SizeCalculator() {
  const [distance, setDistance] = useState(10);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('feet');
  const [outputUnit, setOutputUnit] = useState<OutputUnit>('inches');
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>('M');

  const maxDistance = distanceUnit === 'feet' ? 100 : 30;

  const { minimumSize, recommendedSize, recommendedCm } = useMemo(() => {
    // Normalize to meters
    const distanceMeters = distanceUnit === 'feet' ? distance * 0.3048 : distance;

    // Calculate in cm with error correction adjustment
    const minCm = distanceMeters * 10 * EC_MULTIPLIERS[errorCorrection];
    const recCm = (distanceMeters * 100 / 7) * EC_MULTIPLIERS[errorCorrection];

    // Convert to output unit
    const convertToUnit = (cm: number): number => {
      switch (outputUnit) {
        case 'inches': return cm / 2.54;
        case 'feet': return cm / 30.48;
        default: return cm;
      }
    };
    const minimum = convertToUnit(minCm);
    const recommended = convertToUnit(recCm);

    return {
      minimumSize: minimum,
      recommendedSize: recommended,
      recommendedCm: recCm,
    };
  }, [distance, distanceUnit, outputUnit, errorCorrection]);

  const formatSize = (size: number): string => {
    if (size < 10) {
      return size.toFixed(1);
    }
    return Math.round(size).toString();
  };

  const getUnitLabel = (unit: OutputUnit): string => {
    switch (unit) {
      case 'inches': return 'in';
      case 'feet': return 'ft';
      default: return 'cm';
    }
  };

  const unitLabel = getUnitLabel(outputUnit);

  const sizeReference = getSizeReference(recommendedCm);

  return (
    <div className="space-y-6">
      {/* Calculator Card */}
      <Card
        className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up"
        style={{ animationDelay: '80ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            Calculate Your Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Distance Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="distance" className="text-base font-medium">
                Scanning Distance
              </Label>
              <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
                <button
                  onClick={() => setDistanceUnit('feet')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    distanceUnit === 'feet'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Feet
                </button>
                <button
                  onClick={() => setDistanceUnit('meters')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    distanceUnit === 'meters'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Meters
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[distance]}
                  onValueChange={([value]) => setDistance(value)}
                  min={1}
                  max={maxDistance}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="w-24">
                <Input
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= maxDistance) {
                      setDistance(val);
                    }
                  }}
                  min={1}
                  max={maxDistance}
                  className="text-center"
                />
              </div>
              <span className="text-slate-400 w-12">{distanceUnit === 'feet' ? 'ft' : 'm'}</span>
            </div>
            <p className="text-sm text-slate-500">
              The expected distance between the QR code and the scanner
            </p>
          </div>

          {/* Error Correction Select */}
          <div className="space-y-3">
            <Label htmlFor="error-correction" className="text-base font-medium">
              Error Correction Level
            </Label>
            <Select
              value={errorCorrection}
              onValueChange={(value) => setErrorCorrection(value as ErrorCorrection)}
            >
              <SelectTrigger id="error-correction" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EC_DESCRIPTIONS) as ErrorCorrection[]).map((level) => (
                  <SelectItem key={level} value={level}>
                    <span className="font-medium">{level}</span>
                    <span className="text-slate-400 ml-2">{EC_DESCRIPTIONS[level]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500">
              Higher error correction requires slightly larger QR codes but provides better damage resistance
            </p>
          </div>

          {/* Output Unit Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <Label className="text-base font-medium">Output Unit</Label>
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setOutputUnit('inches')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  outputUnit === 'inches'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setOutputUnit('cm')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  outputUnit === 'cm'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cm
              </button>
              <button
                onClick={() => setOutputUnit('feet')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  outputUnit === 'feet'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Feet
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Size Card */}
        <Card
          className="bg-slate-800/50 backdrop-blur-xl border-yellow-500/30 animate-slide-up"
          style={{ animationDelay: '160ms' }}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-500 mb-1">Minimum Size</p>
                <p className="text-3xl font-bold text-white">
                  {formatSize(minimumSize)}
                  <span className="text-lg text-slate-400 ml-1">{unitLabel}</span>
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {formatSize(minimumSize)} &times; {formatSize(minimumSize)} {unitLabel}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Absolute minimum for scanning at this distance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Size Card */}
        <Card
          className="bg-slate-800/50 backdrop-blur-xl border-primary/30 glow animate-slide-up"
          style={{ animationDelay: '240ms' }}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary mb-1">Recommended Size</p>
                <p className="text-3xl font-bold text-white">
                  {formatSize(recommendedSize)}
                  <span className="text-lg text-slate-400 ml-1">{unitLabel}</span>
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {formatSize(recommendedSize)} &times; {formatSize(recommendedSize)} {unitLabel}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Optimal size for reliable scanning
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Size Comparison Visual */}
      <Card
        className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 animate-slide-up"
        style={{ animationDelay: '320ms' }}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Size Comparison</p>
              <p className="text-lg font-semibold text-white">
                About the size of a {sizeReference.label.toLowerCase()}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Your recommended QR code is approximately {formatSize(recommendedCm)} cm
              </p>
            </div>
            <div className="text-6xl">{sizeReference.emoji}</div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div
        className="text-center pt-4 animate-slide-up"
        style={{ animationDelay: '400ms' }}
      >
        <p className="text-slate-400 mb-4">
          Ready to create your perfectly-sized QR code?
        </p>
        <Link href="/qr-codes/new">
          <Button size="lg" className="glow-hover group">
            Create QR Code at Perfect Size
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
