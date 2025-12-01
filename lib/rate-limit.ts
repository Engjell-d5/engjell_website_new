// Simple in-memory rate limiter
// For production, consider using Redis or a proper rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  // Clean up old entries (simple garbage collection)
  if (Object.keys(store).length > 10000) {
    for (const k in store) {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    }
  }
  
  // Get or create entry
  let entry = store[key];
  
  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + options.windowMs,
    };
    store[key] = entry;
  }
  
  // Increment counter
  entry.count++;
  
  const allowed = entry.count <= options.maxRequests;
  const remaining = Math.max(0, options.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

export function getClientIdentifier(request: Request): string {
  // Use IP address as identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}


