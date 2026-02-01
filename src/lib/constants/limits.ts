/**
 * Centralized constants for limits and configuration values
 * Import from this file instead of defining locally
 */

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  logo: 1024 * 1024,           // 1MB
  pdf: 10 * 1024 * 1024,       // 10MB
  image: 5 * 1024 * 1024,      // 5MB
  video: 100 * 1024 * 1024,    // 100MB
  audio: 20 * 1024 * 1024,     // 20MB
} as const;

// Allowed MIME types by media type
export const ALLOWED_MIME_TYPES = {
  logo: ['image/png', 'image/jpeg', 'image/svg+xml'],
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mp4'],
} as const;

// API validation limits
export const VALIDATION_LIMITS = {
  nameLength: 255,
  urlLength: 2048,
  contentSize: 10000,
} as const;

// Pagination defaults
export const PAGINATION = {
  scansPerPage: 10,
  qrCodesPerPage: 20,
  maxScansForAggregation: 10000,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  windowMs: 60 * 1000,   // 1 minute
  maxRequests: 60,       // 60 requests per minute per key
} as const;

// Scan limits per tier (per month)
// Note: -1 means unlimited
export const SCAN_LIMITS = {
  free: 100,
  pro: 10000,
  business: -1,
} as const;

// Dynamic QR code limits per tier
// Note: -1 means unlimited
export const DYNAMIC_QR_LIMITS = {
  free: 0,
  pro: 50,
  business: -1,
} as const;

// Team member limits per tier
export const TEAM_MEMBER_LIMITS = {
  free: 1,
  pro: 1,
  business: 3,
} as const;

// API key limits per tier
export const API_KEY_LIMITS = {
  free: 0,
  pro: 0,
  business: 5,
} as const;

// Campaign limits per tier
// Note: -1 means unlimited
export const CAMPAIGN_LIMITS = {
  free: 0,
  pro: 5,
  business: -1,
} as const;

// Helper function to check if within scan limit
export function isWithinScanLimit(tier: keyof typeof SCAN_LIMITS, currentCount: number): boolean {
  const limit = SCAN_LIMITS[tier];
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

// Helper function to get file size limit
export function getFileSizeLimit(type: keyof typeof FILE_SIZE_LIMITS): number {
  return FILE_SIZE_LIMITS[type];
}

// Helper function to check if MIME type is allowed
export function isAllowedMimeType(type: keyof typeof ALLOWED_MIME_TYPES, mimeType: string): boolean {
  const allowedTypes = ALLOWED_MIME_TYPES[type] as readonly string[];
  return allowedTypes.includes(mimeType);
}
