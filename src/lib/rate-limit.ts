/**
 * Rate Limiting Utility
 *
 * Uses Upstash Redis when available, falls back to in-memory for development.
 * Designed for password verification and other sensitive endpoints.
 */

import { getRedisClient, markRedisUnhealthy } from './redis/client';

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
}

// In-memory fallback for development or when Redis is unavailable
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupInMemory() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.resetAt < now) {
      inMemoryStore.delete(key);
    }
  }
}

/**
 * Check rate limit for an identifier (usually IP address).
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Result with success status, remaining requests, and reset time
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const key = `ratelimit:${identifier}`;
  const windowSeconds = Math.floor(windowMs / 1000);
  const now = Date.now();
  const resetAt = now + windowMs;

  // Try Redis first
  if (redis) {
    try {
      // Use a sliding window counter with Redis
      const count = await redis.incr(key);

      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Get TTL for reset time
      const ttl = await redis.ttl(key);
      const actualReset = ttl > 0 ? now + ttl * 1000 : resetAt;

      if (count > limit) {
        return {
          success: false,
          remaining: 0,
          reset: Math.floor(actualReset / 1000),
        };
      }

      return {
        success: true,
        remaining: limit - count,
        reset: Math.floor(actualReset / 1000),
      };
    } catch (error) {
      console.error('[RateLimit] Redis error, falling back to in-memory:', error);
      markRedisUnhealthy();
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  cleanupInMemory();

  const record = inMemoryStore.get(key);

  if (!record || record.resetAt < now) {
    // First request or expired window
    inMemoryStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      remaining: limit - 1,
      reset: Math.floor(resetAt / 1000),
    };
  }

  // Increment counter
  record.count++;
  inMemoryStore.set(key, record);

  if (record.count > limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.floor(record.resetAt / 1000),
    };
  }

  return {
    success: true,
    remaining: limit - record.count,
    reset: Math.floor(record.resetAt / 1000),
  };
}

/**
 * Reset rate limit for an identifier (e.g., after successful verification).
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const redis = getRedisClient();
  const key = `ratelimit:${identifier}`;

  if (redis) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('[RateLimit] Redis delete error:', error);
      markRedisUnhealthy();
    }
  }

  // Also clear in-memory
  inMemoryStore.delete(key);
}

/**
 * Get client IP from request headers.
 * Handles common reverse proxy headers.
 */
export function getClientIP(request: Request): string {
  // Check common headers for proxied requests
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback - this won't work in serverless but prevents crashes
  return 'unknown';
}
