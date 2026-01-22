import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a URL to ensure it has a protocol (https:// by default)
 * - If URL already has http:// or https://, returns as-is
 * - If URL starts with //, prepends https:
 * - Otherwise, prepends https://
 *
 * @param url - The URL to normalize
 * @returns The normalized URL with protocol
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;

  const trimmed = url.trim();

  // Already has a protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Protocol-relative URL (//example.com)
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // No protocol - add https://
  return `https://${trimmed}`;
}

/**
 * Validates if a string is a valid URL
 *
 * @param url - The URL to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    const normalized = normalizeUrl(url);
    const parsed = new URL(normalized);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * CRITICAL: Gets the application base URL for QR code generation.
 *
 * This function ensures the URL is always valid with a proper protocol.
 * If NEXT_PUBLIC_APP_URL is misconfigured (empty, path only, or invalid),
 * it falls back to the production URL to prevent broken QR codes.
 *
 * @returns A valid base URL starting with https://
 */
export function getAppUrl(): string {
  const FALLBACK_URL = 'https://qrwolf.com';
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;

  // If env var is not set or empty, use fallback
  if (!envUrl || envUrl.trim() === '') {
    return FALLBACK_URL;
  }

  const trimmed = envUrl.trim();

  // Must start with http:// or https:// to be valid
  if (/^https?:\/\//i.test(trimmed)) {
    // Remove trailing slash for consistency
    return trimmed.replace(/\/+$/, '');
  }

  // If it's just a path like "/" or "/app", use fallback
  // This prevents QR codes from encoding invalid URLs
  console.warn(`[getAppUrl] Invalid NEXT_PUBLIC_APP_URL: "${envUrl}". Using fallback: ${FALLBACK_URL}`);
  return FALLBACK_URL;
}
