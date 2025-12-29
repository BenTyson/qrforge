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
