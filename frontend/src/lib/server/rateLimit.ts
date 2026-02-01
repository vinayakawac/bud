/**
 * Rate Limiting System
 * 
 * In-memory rate limiter with sliding window algorithm.
 * Protects against abuse without external dependencies.
 * 
 * NOTE: For production at scale, replace with Redis-based limiter.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimited } from './response';

// ============================================================================
// TYPES
// ============================================================================

interface RateLimitEntry {
  count: number;
  windowStart: number;
  timestamps: number[]; // For sliding window
}

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
}

// ============================================================================
// IN-MEMORY STORE
// ============================================================================

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > entry.timestamps.length * 60000) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

// ============================================================================
// RATE LIMIT CONFIGS
// ============================================================================

export const rateLimitConfigs = {
  /**
   * Auth endpoints (login, register)
   * 5 attempts per 15 minutes
   */
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  } as RateLimitConfig,

  /**
   * Public API (read operations)
   * 100 requests per minute
   */
  publicRead: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  } as RateLimitConfig,

  /**
   * Write operations (create, update)
   * 30 requests per minute
   */
  write: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  } as RateLimitConfig,

  /**
   * Sensitive operations (delete, admin actions)
   * 10 requests per minute
   */
  sensitive: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  } as RateLimitConfig,

  /**
   * Contact form / ratings
   * 3 requests per hour
   */
  submission: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  } as RateLimitConfig,

  /**
   * File uploads
   * 10 requests per hour
   */
  upload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  } as RateLimitConfig,
};

// ============================================================================
// CORE RATE LIMIT LOGIC
// ============================================================================

/**
 * Extract client identifier from request
 */
function getClientKey(request: NextRequest): string {
  // Try to get real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';
  
  return ip;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = config.keyGenerator?.(request) || getClientKey(request);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = {
      count: 0,
      windowStart: now,
      timestamps: [],
    };
    rateLimitStore.set(key, entry);
  }

  // Sliding window: remove old timestamps
  entry.timestamps = entry.timestamps.filter(t => t > windowStart);
  
  const currentCount = entry.timestamps.length;
  const remaining = Math.max(0, config.maxRequests - currentCount);
  const resetAt = entry.timestamps.length > 0 
    ? entry.timestamps[0] + config.windowMs 
    : now + config.windowMs;

  if (currentCount >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Record this request
  entry.timestamps.push(now);
  entry.count = entry.timestamps.length;

  return { allowed: true, remaining: remaining - 1, resetAt };
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export type RateLimitedHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: RateLimitedHandler
): RateLimitedHandler {
  return async (request: NextRequest, context?: any) => {
    const result = checkRateLimit(request, config);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      
      const response = rateLimited(
        `Too many requests. Please try again in ${retryAfter} seconds.`
      );
      
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
      response.headers.set('Retry-After', retryAfter.toString());
      
      return response;
    }

    const response = await handler(request, context);

    // Add rate limit headers to successful responses too
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetAt.toString());

    return response;
  };
}

// ============================================================================
// COMPOSITE RATE LIMITER
// ============================================================================

/**
 * Create a rate limiter that combines multiple limits
 * (e.g., per-IP AND per-user)
 */
export function createRateLimiter(configs: {
  perIp?: RateLimitConfig;
  perUser?: RateLimitConfig;
  global?: RateLimitConfig;
}) {
  return (request: NextRequest, userId?: string) => {
    const results: Array<{ name: string; result: ReturnType<typeof checkRateLimit> }> = [];

    if (configs.global) {
      results.push({
        name: 'global',
        result: checkRateLimit(request, {
          ...configs.global,
          keyGenerator: () => 'global',
        }),
      });
    }

    if (configs.perIp) {
      results.push({
        name: 'perIp',
        result: checkRateLimit(request, configs.perIp),
      });
    }

    if (configs.perUser && userId) {
      results.push({
        name: 'perUser',
        result: checkRateLimit(request, {
          ...configs.perUser,
          keyGenerator: () => `user:${userId}`,
        }),
      });
    }

    // Return the most restrictive result
    const blocked = results.find(r => !r.result.allowed);
    if (blocked) {
      return { 
        allowed: false as const, 
        blockedBy: blocked.name, 
        remaining: blocked.result.remaining,
        resetAt: blocked.result.resetAt,
      };
    }

    const minRemaining = Math.min(...results.map(r => r.result.remaining));
    return { allowed: true as const, remaining: minRemaining, blockedBy: null, resetAt: Date.now() + 60000 };
  };
}

// ============================================================================
// SPECIALIZED LIMITERS
// ============================================================================

/**
 * Auth-specific rate limiter with progressive backoff
 */
export function createAuthRateLimiter() {
  const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

  return {
    check(request: NextRequest): { allowed: boolean; waitSeconds: number } {
      const ip = getClientKey(request);
      const now = Date.now();
      const entry = failedAttempts.get(ip);

      if (!entry) {
        return { allowed: true, waitSeconds: 0 };
      }

      // Reset after 1 hour
      if (now - entry.lastAttempt > 60 * 60 * 1000) {
        failedAttempts.delete(ip);
        return { allowed: true, waitSeconds: 0 };
      }

      // Progressive backoff: 2^attempts seconds, max 15 minutes
      const waitSeconds = Math.min(Math.pow(2, entry.count), 15 * 60);
      const waitUntil = entry.lastAttempt + waitSeconds * 1000;

      if (now < waitUntil) {
        return { allowed: false, waitSeconds: Math.ceil((waitUntil - now) / 1000) };
      }

      return { allowed: true, waitSeconds: 0 };
    },

    recordFailure(request: NextRequest) {
      const ip = getClientKey(request);
      const entry = failedAttempts.get(ip);
      
      if (entry) {
        entry.count++;
        entry.lastAttempt = Date.now();
      } else {
        failedAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
      }
    },

    recordSuccess(request: NextRequest) {
      const ip = getClientKey(request);
      failedAttempts.delete(ip);
    },
  };
}

// Create singleton auth limiter
export const authRateLimiter = createAuthRateLimiter();
