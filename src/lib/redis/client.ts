/**
 * Upstash Redis Client with Graceful Fallback
 *
 * Returns null if Redis is not configured or unavailable.
 * Callers should always handle the null case by falling back to in-memory.
 */

import { Redis } from '@upstash/redis';

// Singleton Redis instance
let redis: Redis | null = null;
let isConfigured = false;
let lastHealthCheck = 0;
let isHealthy = true;
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

/**
 * Get the Redis client instance.
 * Returns null if Redis is not configured or unhealthy.
 */
export function getRedisClient(): Redis | null {
  // Check if Redis is enabled via feature flag
  if (process.env.ENABLE_REDIS_RATE_LIMIT !== 'true') {
    return null;
  }

  // Check if Redis is configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  // Return null if recent health check failed
  if (!isHealthy && Date.now() - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return null;
  }

  // Initialize singleton if needed
  if (!redis || !isConfigured) {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      isConfigured = true;
    } catch (error) {
      console.error('[Redis] Failed to initialize client:', error);
      isHealthy = false;
      lastHealthCheck = Date.now();
      return null;
    }
  }

  return redis;
}

/**
 * Mark Redis as unhealthy (called on connection errors).
 * Will retry after HEALTH_CHECK_INTERVAL.
 */
export function markRedisUnhealthy(): void {
  isHealthy = false;
  lastHealthCheck = Date.now();
}

/**
 * Check if Redis is currently available.
 */
export async function isRedisAvailable(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.ping();
    isHealthy = true;
    return true;
  } catch {
    markRedisUnhealthy();
    return false;
  }
}

/**
 * Get Redis status for monitoring/debugging.
 */
export function getRedisStatus(): {
  enabled: boolean;
  configured: boolean;
  healthy: boolean;
} {
  return {
    enabled: process.env.ENABLE_REDIS_RATE_LIMIT === 'true',
    configured: isConfigured,
    healthy: isHealthy,
  };
}
