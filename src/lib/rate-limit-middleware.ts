import { NextRequest, NextResponse } from 'next/server';
import { EnhancedRateLimiter } from './enhanced-rate-limiter';
import { logger } from './logger';

interface RateLimitOptions {
  keyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest, result: unknown) => NextResponse | Promise<NextResponse>;
  skipOnError?: boolean;
}

/**
 * Rate limiting middleware factory
 */
export function withRateLimit(
  config: {
    window: number;
    max: number;
    identifier?: string;
  },
  options: RateLimitOptions = {}
) {
  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: () => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> {
    try {
      // Generate rate limit key
      const defaultKey = req.ip || 'anonymous';
      const identifier = config.identifier || 
                        options.keyGenerator?.(req) || 
                        defaultKey;

      // Check rate limit
      const result = await EnhancedRateLimiter.checkLimit({
        identifier,
        window: config.window,
        max: config.max,
        skipSuccessfulRequestsOnError: options.skipOnError,
      });

      // Add rate limit headers
      const response = result.allowed ? 
                      await handler() : 
                      options.onLimitReached?.(req, result) || 
                      createRateLimitResponse(result);

      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.reset.toString());
      
      if (result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString());
      }

      // Log rate limit events
      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          identifier,
          limit: result.limit,
          used: result.used,
          endpoint: req.nextUrl.pathname,
          userAgent: req.headers.get('user-agent'),
          ip: req.ip,
        });
      }

      return response;

    } catch (error) {
      logger.error('Rate limit middleware error', {
        endpoint: req.nextUrl.pathname,
        identifier: config.identifier,
      }, error instanceof Error ? error : new Error(String(error)));

      // On error, either allow or deny based on configuration
      if (options.skipOnError !== false) {
        return handler();
      } else {
        return NextResponse.json(
          { error: 'Rate limiting service unavailable' },
          { status: 503 }
        );
      }
    }
  };
}

/**
 * User-specific rate limiting middleware
 */
export function withUserRateLimit(
  subscriptionTier?: 'trial' | 'starter' | 'growth' | 'scale',
  options: RateLimitOptions = {}
) {
  return async function userRateLimitMiddleware(
    req: NextRequest,
    handler: (userId: string, orgId: string) => Promise<NextResponse> | NextResponse,
    userId: string,
    organizationId: string
  ): Promise<NextResponse> {
    try {
      const result = await EnhancedRateLimiter.checkUserLimit(
        userId,
        organizationId,
        subscriptionTier
      );

      if (!result.allowed) {
        const response = options.onLimitReached?.(req, result) || 
                        createRateLimitResponse(result, 'User rate limit exceeded');

        // Add headers
        response.headers.set('X-RateLimit-Limit', result.limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', result.reset.toString());
        
        if (result.retryAfter) {
          response.headers.set('Retry-After', result.retryAfter.toString());
        }

        logger.warn('User rate limit exceeded', {
          userId,
          organizationId,
          subscriptionTier,
          endpoint: req.nextUrl.pathname,
        });

        return response;
      }

      const response = await handler(userId, organizationId);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.reset.toString());

      return response;

    } catch (error) {
      logger.error('User rate limit middleware error', {
        userId,
        organizationId,
        endpoint: req.nextUrl.pathname,
      }, error instanceof Error ? error : new Error(String(error)));

      if (options.skipOnError !== false) {
        return handler(userId, organizationId);
      } else {
        return NextResponse.json(
          { error: 'Rate limiting service unavailable' },
          { status: 503 }
        );
      }
    }
  };
}

/**
 * API endpoint rate limiting middleware
 */
export function withEndpointRateLimit(
  endpoint: string,
  tier: 'public' | 'authenticated' | 'premium' = 'authenticated',
  options: RateLimitOptions = {}
) {
  return async function endpointRateLimitMiddleware(
    req: NextRequest,
    handler: () => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> {
    const identifier = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
    
    const result = await EnhancedRateLimiter.checkEndpointLimit(
      endpoint,
      identifier,
      tier
    );

    if (!result.allowed) {
      const response = options.onLimitReached?.(req, result) || 
                      createRateLimitResponse(result, `${endpoint} rate limit exceeded`);

      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', result.reset.toString());
      
      if (result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString());
      }

      logger.warn('Endpoint rate limit exceeded', {
        endpoint,
        tier,
        identifier,
        ip: req.ip,
      });

      return response;
    }

    const response = await handler();
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());

    return response;
  };
}

function createRateLimitResponse(result: { limit: number; reset: number; retryAfter?: number }, message = 'Rate limit exceeded'): NextResponse {
  return NextResponse.json(
    {
      error: message,
      limit: result.limit,
      remaining: 0,
      reset: result.reset,
      retryAfter: result.retryAfter,
    },
    { status: 429 }
  );
}