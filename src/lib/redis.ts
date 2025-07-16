import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache key prefixes
export const CACHE_PREFIXES = {
  brandMention: 'bm:',
  queryResult: 'qr:',
  projectMetrics: 'pm:',
  competitorData: 'cd:',
  userSession: 'us:',
  rateLimit: 'rl:',
} as const;

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  brandMention: 3600, // 1 hour
  queryResult: 7200, // 2 hours
  projectMetrics: 300, // 5 minutes
  competitorData: 3600, // 1 hour
  userSession: 86400, // 24 hours
  rateLimit: 60, // 1 minute
} as const;

// Helper functions for common Redis operations
export class RedisCache {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  static async set(
    key: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    try {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  static async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  static async invalidatePattern(pattern: string): Promise<number> {
    try {
      // Note: Upstash doesn't support SCAN, so we need to track keys separately
      // This is a simplified version - in production, you'd want to maintain a key index
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Redis invalidate pattern error:', error);
      return 0;
    }
  }
}

// Rate limiting helper
export class RateLimiter {
  static async checkLimit(
    identifier: string,
    limit: number,
    window: number = 60 // seconds
  ): Promise<{ allowed: boolean; remaining: number; reset: number }> {
    const key = `${CACHE_PREFIXES.rateLimit}${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;

    try {
      // Remove old entries
      await redis.zremrangebyscore(key, 0, windowStart);

      // Count current entries
      const count = await redis.zcard(key);

      if (count < limit) {
        // Add current request
        await redis.zadd(key, { score: now, member: `${now}` });
        await redis.expire(key, window);

        return {
          allowed: true,
          remaining: limit - count - 1,
          reset: Math.floor((now + window * 1000) / 1000),
        };
      }

      return {
        allowed: false,
        remaining: 0,
        reset: Math.floor((now + window * 1000) / 1000),
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request on error to avoid blocking users
      return {
        allowed: true,
        remaining: limit,
        reset: Math.floor((now + window * 1000) / 1000),
      };
    }
  }
}