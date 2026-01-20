/**
 * Mock rate limiter for tests
 * Always allows requests (in-memory simulation)
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  source: 'redis' | 'memory';
}

export async function checkRateLimit(): Promise<RateLimitResult> {
  return {
    allowed: true,
    remaining: 59,
    resetAt: Date.now() + 60000,
    source: 'memory',
  };
}

export function checkRateLimitSync(): RateLimitResult {
  return {
    allowed: true,
    remaining: 59,
    resetAt: Date.now() + 60000,
    source: 'memory',
  };
}

export async function getRateLimitStatus() {
  return {
    count: 1,
    limit: 60,
    remaining: 59,
    resetAt: Date.now() + 60000,
  };
}
