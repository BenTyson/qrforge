'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { GeoContent } from '@/lib/qr/types';

interface GeoFormProps {
  content: Partial<GeoContent>;
  onChange: (content: GeoContent) => void;
}

export function GeoForm({ content, onChange }: GeoFormProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleChange = (field: keyof GeoContent, value: string | number) => {
    onChange({
      type: 'geo',
      latitude: content.latitude ?? 0,
      longitude: content.longitude ?? 0,
      locationName: content.locationName,
      address: content.address,
      accentColor: content.accentColor,
      [field]: value,
    });
  };

  const handleLatitudeChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      handleChange('latitude', num);
    } else if (value === '' || value === '-') {
      handleChange('latitude', 0);
    }
  };

  const handleLongitudeChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      handleChange('longitude', num);
    } else if (value === '' || value === '-') {
      handleChange('longitude', 0);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          type: 'geo',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationName: content.locationName,
          address: content.address,
          accentColor: content.accentColor,
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access was denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Validate coordinates
  const isLatitudeValid = content.latitude === undefined ||
    (content.latitude >= -90 && content.latitude <= 90);
  const isLongitudeValid = content.longitude === undefined ||
    (content.longitude >= -180 && content.longitude <= 180);

  return (
    <div className="space-y-4">
      {/* Use Current Location Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="w-full"
        >
          {isLocating ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Getting location...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
              </svg>
              Use my current location
            </span>
          )}
        </Button>
        {locationError && (
          <p className="text-sm text-red-500 mt-2">{locationError}</p>
        )}
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or enter coordinates manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude *</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="40.7128"
            value={content.latitude ?? ''}
            onChange={(e) => handleLatitudeChange(e.target.value)}
            className={`mt-1 bg-secondary/50 ${!isLatitudeValid ? 'border-red-500' : ''}`}
          />
          {!isLatitudeValid && (
            <p className="text-xs text-red-500 mt-1">Must be between -90 and 90</p>
          )}
        </div>
        <div>
          <Label htmlFor="longitude">Longitude *</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="-74.0060"
            value={content.longitude ?? ''}
            onChange={(e) => handleLongitudeChange(e.target.value)}
            className={`mt-1 bg-secondary/50 ${!isLongitudeValid ? 'border-red-500' : ''}`}
          />
          {!isLongitudeValid && (
            <p className="text-xs text-red-500 mt-1">Must be between -180 and 180</p>
          )}
        </div>
      </div>

      {/* Location Name */}
      <div>
        <Label htmlFor="locationName">Location Name (optional)</Label>
        <Input
          id="locationName"
          type="text"
          placeholder="Empire State Building"
          value={content.locationName || ''}
          onChange={(e) => handleChange('locationName', e.target.value)}
          className="mt-1 bg-secondary/50"
        />
        <p className="text-xs text-muted-foreground mt-1">
          A friendly name for the location
        </p>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">Address (optional)</Label>
        <textarea
          id="address"
          placeholder="350 Fifth Avenue, New York, NY 10118"
          value={content.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          className="mt-1 w-full min-h-[80px] rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Accent Color */}
      <div>
        <Label htmlFor="accentColor">Accent Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="accentColor"
            type="color"
            value={content.accentColor || '#3B82F6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="w-12 h-10 p-1 bg-secondary/50 cursor-pointer"
          />
          <Input
            type="text"
            placeholder="#3B82F6"
            value={content.accentColor || '#3B82F6'}
            onChange={(e) => handleChange('accentColor', e.target.value)}
            className="flex-1 bg-secondary/50 font-mono"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Customize the landing page accent color
        </p>
      </div>

      {/* Preview hint */}
      {content.latitude !== undefined && content.longitude !== undefined && isLatitudeValid && isLongitudeValid && (
        <div className="p-4 bg-secondary/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${content.accentColor || '#3B82F6'}20` }}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={content.accentColor || '#3B82F6'}
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {content.locationName || 'Location'}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {content.latitude?.toFixed(6)}, {content.longitude?.toFixed(6)}
              </p>
              {content.address && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{content.address}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
