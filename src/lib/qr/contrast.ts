/**
 * Contrast ratio utilities for QR code scannability
 * Based on WCAG 2.1 contrast ratio calculations
 */

export type ContrastLevel = 'excellent' | 'good' | 'poor' | 'fail';

/**
 * Convert hex color to RGB values
 * Supports both 3-digit (#FFF) and 6-digit (#FFFFFF) formats
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Handle 3-digit hex (#FFF -> #FFFFFF)
  if (cleanHex.length === 3) {
    const expanded = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
    return hexToRgb('#' + expanded);
  }

  // Handle 6-digit hex
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return -1; // Return -1 for invalid colors

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio per WCAG 2.1
 * Returns ratio between 1:1 (identical) and 21:1 (black/white)
 * Returns null if either color is invalid
 */
export function getContrastRatio(hex1: string, hex2: string): number | null {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);

  // Return null if either color is invalid
  if (l1 < 0 || l2 < 0) return null;

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Map contrast ratio to scannability level
 * Based on QR code scanning requirements (stricter than WCAG text)
 */
export function getContrastLevel(ratio: number | null): ContrastLevel {
  if (ratio === null) return 'fail';
  if (ratio >= 7) return 'excellent';
  if (ratio >= 4.5) return 'good';
  if (ratio >= 3) return 'poor';
  return 'fail';
}

/**
 * Get display information for a contrast level
 */
export function getContrastInfo(level: ContrastLevel): {
  label: string;
  description: string;
  colorClass: string;
  bgColorClass: string;
} {
  switch (level) {
    case 'excellent':
      return {
        label: 'Excellent',
        description: 'Perfect contrast for all scanning conditions',
        colorClass: 'text-green-500',
        bgColorClass: 'bg-green-500/20',
      };
    case 'good':
      return {
        label: 'Good',
        description: 'Sufficient contrast for most conditions',
        colorClass: 'text-primary',
        bgColorClass: 'bg-primary/20',
      };
    case 'poor':
      return {
        label: 'Poor',
        description: 'May have scanning issues in low light',
        colorClass: 'text-yellow-500',
        bgColorClass: 'bg-yellow-500/20',
      };
    case 'fail':
      return {
        label: 'Fail',
        description: 'Will likely fail to scan - increase contrast',
        colorClass: 'text-red-500',
        bgColorClass: 'bg-red-500/20',
      };
  }
}

/**
 * Check if a hex color string is valid and complete
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);
}
