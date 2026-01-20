/**
 * Distributed Rate Limiter with Graceful Fallback
 *
 * Uses Upstash Redis for distributed rate limiting across serverless instances.
 * Falls back to in-memory rate limiting if Redis is unavailable.
 */

import { getRedisClient, markRedisUnhealthy } from './client';

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per key

// In-memory fallback (same as original implementation)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Clean up old in-memory entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryStore.entries()) {
      if (entry.resetAt < now) {
        inMemoryStore.delete(key);
      }
    }
  }, 60000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  source: 'redis' | 'memory';
}

/**
 * Check rate limit for a given key (e.g., API key hash).
 * Uses Redis if available, falls back to in-memory.
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // Try Redis first
  if (redis) {
    try {
      return await checkRateLimitRedis(key);
    } catch (error) {
      console.error('[RateLimiter] Redis error, falling back to memory:', error);
      markRedisUnhealthy();
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  return checkRateLimitMemory(key);
}

/**
 * Redis-based rate limiting using sliding window counter.
 */
async function checkRateLimitRedis(key: string): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error('Redis not available');
  }

  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / RATE_LIMIT_WINDOW_MS)}`;
  const resetAt = (Math.floor(now / RATE_LIMIT_WINDOW_MS) + 1) * RATE_LIMIT_WINDOW_MS;

  // Use Redis INCR with expiry for atomic increment
  const pipeline = redis.pipeline();
  pipeline.incr(windowKey);
  pipeline.expire(windowKey, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) + 1);

  const results = await pipeline.exec();
  const count = results[0] as number;

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - count);
  const allowed = count <= RATE_LIMIT_MAX_REQUESTS;

  return {
    allowed,
    remaining,
    resetAt,
    source: 'redis',
  };
}

/**
 * In-memory rate limiting (fallback).
 * Same logic as the original implementation.
 */
function checkRateLimitMemory(key: string): RateLimitResult {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    inMemoryStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt,
      source: 'memory',
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      source: 'memory',
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
    source: 'memory',
  };
}

/**
 * Sync version for use in places that can't use async.
 * Always uses in-memory (synchronous).
 */
export function checkRateLimitSync(key: string): RateLimitResult {
  return checkRateLimitMemory(key);
}

/**
 * Get current rate limit status without incrementing.
 * Useful for showing remaining requests to users.
 */
export async function getRateLimitStatus(key: string): Promise<{
  count: number;
  limit: number;
  remaining: number;
  resetAt: number | null;
}> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const now = Date.now();
      const windowKey = `ratelimit:${key}:${Math.floor(now / RATE_LIMIT_WINDOW_MS)}`;
      const count = (await redis.get<number>(windowKey)) || 0;

      return {
        count,
        limit: RATE_LIMIT_MAX_REQUESTS,
        remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - count),
        resetAt: (Math.floor(now / RATE_LIMIT_WINDOW_MS) + 1) * RATE_LIMIT_WINDOW_MS,
      };
    } catch {
      // Fall through to memory
    }
  }

  const entry = inMemoryStore.get(key);
  if (!entry || entry.resetAt < Date.now()) {
    return {
      count: 0,
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      resetAt: null,
    };
  }

  return {
    count: entry.count,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count),
    resetAt: entry.resetAt,
  };
}
