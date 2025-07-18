import { redis, CACHE_PREFIXES } from './redis';
import { logger } from './logger';

interface RateLimitConfig {
  window: number; // in seconds
  max: number;    // max requests per window
  identifier: string;
  skipSuccessfulRequestsOnError?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  reset: number; // timestamp when window resets
  retryAfter?: number; // seconds to wait before retry
}

export class EnhancedRateLimiter {
  /**
   * Sliding window rate limiter with Redis
   */
  static async checkLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { identifier, max, window, skipSuccessfulRequestsOnError = true } = config;
    const key = `${CACHE_PREFIXES.rateLimit}${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current entries in window
      pipeline.zcard(key);
      
      // Execute pipeline
      const results = await pipeline.exec();
      const count = results?.[1]?.[1] as number || 0;

      if (count < max) {
        // Add current request to sorted set
        await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
        await redis.expire(key, window + 1); // +1 for buffer

        return {
          allowed: true,
          limit: max,
          used: count + 1,
          remaining: max - count - 1,
          reset: Math.floor((now + window * 1000) / 1000),
        };
      }

      // Get oldest entry to calculate retry time
      const oldestEntries = await redis.zrange(key, 0, 0, { withScores: true });
      const oldestScore = oldestEntries.length > 0 ? oldestEntries[0].score! : now;
      const retryAfter = Math.ceil((oldestScore + window * 1000 - now) / 1000);

      return {
        allowed: false,
        limit: max,
        used: count,
        remaining: 0,
        reset: Math.floor((oldestScore + window * 1000) / 1000),
        retryAfter: Math.max(retryAfter, 1),
      };

    } catch (error) {
      logger.error('Enhanced rate limiter operation failed', {
        identifier,
        window,
        max,
      }, error instanceof Error ? error : new Error(String(error)));

      // Fail open vs fail closed decision
      if (skipSuccessfulRequestsOnError) {
        return {
          allowed: true,
          limit: max,
          used: 0,
          remaining: max,
          reset: Math.floor((now + window * 1000) / 1000),
        };
      } else {
        return {
          allowed: false,
          limit: max,
          used: max,
          remaining: 0,
          reset: Math.floor((now + window * 1000) / 1000),
          retryAfter: 60,
        };
      }
    }
  }

  /**
   * Multi-tier rate limiting (burst + sustained)
   */
  static async checkMultiTierLimit(
    identifier: string,
    tiers: Array<{ window: number; max: number }>
  ): Promise<RateLimitResult> {
    // Check all tiers and return the most restrictive
    const results = await Promise.all(
      tiers.map((tier, index) => 
        this.checkLimit({
          identifier: `${identifier}:tier${index}`,
          window: tier.window,
          max: tier.max,
        })
      )
    );

    // Find the most restrictive result
    const restrictive = results.find(r => !r.allowed) || 
                       results.reduce((prev, curr) => 
                         curr.remaining < prev.remaining ? curr : prev
                       );

    return restrictive;
  }

  /**
   * User-specific rate limiting based on subscription tier
   */
  static async checkUserLimit(
    userId: string,
    organizationId: string,
    subscriptionTier: 'trial' | 'starter' | 'growth' | 'scale' = 'trial'
  ): Promise<RateLimitResult> {
    const limits = this.getTierLimits(subscriptionTier);
    
    return this.checkMultiTierLimit(`user:${userId}:org:${organizationId}`, [
      { window: 60, max: limits.perMinute },     // Burst protection
      { window: 3600, max: limits.perHour },    // Hourly limit
      { window: 86400, max: limits.perDay },    // Daily limit
    ]);
  }

  /**
   * API endpoint rate limiting
   */
  static async checkEndpointLimit(
    endpoint: string,
    identifier: string,
    tier: 'public' | 'authenticated' | 'premium' = 'authenticated'
  ): Promise<RateLimitResult> {
    const endpointLimits = {
      public: { window: 60, max: 10 },
      authenticated: { window: 60, max: 100 },
      premium: { window: 60, max: 500 },
    };

    const limit = endpointLimits[tier];
    return this.checkLimit({
      identifier: `endpoint:${endpoint}:${identifier}`,
      window: limit.window,
      max: limit.max,
    });
  }

  /**
   * Global rate limiting for expensive operations
   */
  static async checkGlobalLimit(
    operation: 'llm_query' | 'data_export' | 'bulk_operation',
    identifier: string
  ): Promise<RateLimitResult> {
    const operationLimits = {
      llm_query: { window: 60, max: 10 },
      data_export: { window: 3600, max: 5 },
      bulk_operation: { window: 3600, max: 3 },
    };

    const limit = operationLimits[operation];
    return this.checkLimit({
      identifier: `global:${operation}:${identifier}`,
      window: limit.window,
      max: limit.max,
      skipSuccessfulRequestsOnError: false, // Fail closed for expensive ops
    });
  }

  private static getTierLimits(tier: string) {
    const tierLimits = {
      trial: { perMinute: 5, perHour: 25, perDay: 25 },
      starter: { perMinute: 10, perHour: 200, perDay: 500 },
      growth: { perMinute: 20, perHour: 1000, perDay: 2500 },
      scale: { perMinute: 50, perHour: 5000, perDay: 10000 },
    };

    return tierLimits[tier as keyof typeof tierLimits] || tierLimits.trial;
  }

  /**
   * Reset rate limit for a specific identifier (admin function)
   */
  static async resetLimit(identifier: string): Promise<boolean> {
    try {
      const pattern = `${CACHE_PREFIXES.rateLimit}${identifier}*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info('Rate limit reset', { identifier, keysRemoved: keys.length });
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to reset rate limit', { identifier }, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
}