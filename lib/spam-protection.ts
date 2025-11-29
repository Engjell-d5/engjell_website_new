import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface RateLimitEntry {
  ip: string;
  count: number;
  resetTime: number;
}

const DATA_DIR = join(process.cwd(), 'data');
const RATE_LIMIT_FILE = join(DATA_DIR, 'rate-limits.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per 15 minutes per IP
const MIN_FORM_TIME = 3000; // Minimum 3 seconds to fill form (in milliseconds)

// Spam keywords to check for
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'lottery', 'winner', 'prize',
  'click here', 'buy now', 'limited time', 'act now', 'urgent',
  'make money', 'work from home', 'get rich', 'free money',
  'nigerian prince', 'inheritance', 'lottery winner'
];

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP.trim();
  }
  return 'unknown';
}

// Load rate limit data
function loadRateLimits(): Record<string, RateLimitEntry> {
  try {
    if (existsSync(RATE_LIMIT_FILE)) {
      const data = readFileSync(RATE_LIMIT_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading rate limits:', error);
  }
  return {};
}

// Save rate limit data
function saveRateLimits(limits: Record<string, RateLimitEntry>): void {
  try {
    // Clean up expired entries
    const now = Date.now();
    const cleaned: Record<string, RateLimitEntry> = {};
    for (const [ip, entry] of Object.entries(limits)) {
      if (entry.resetTime > now) {
        cleaned[ip] = entry;
      }
    }
    writeFileSync(RATE_LIMIT_FILE, JSON.stringify(cleaned, null, 2));
  } catch (error) {
    console.error('Error saving rate limits:', error);
  }
}

// Check rate limit
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const limits = loadRateLimits();
  const now = Date.now();
  
  if (!limits[ip] || limits[ip].resetTime < now) {
    // New window
    limits[ip] = {
      ip,
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    saveRateLimits(limits);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  
  if (limits[ip].count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  
  limits[ip].count++;
  saveRateLimits(limits);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - limits[ip].count };
}

// Check for spam keywords
function containsSpamKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// Count links in text
function countLinks(text: string): number {
  const linkRegex = /https?:\/\/[^\s]+/gi;
  const matches = text.match(linkRegex);
  return matches ? matches.length : 0;
}

// Validate form submission
export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export function checkSpam(
  request: NextRequest,
  body: any,
  formStartTime?: number
): SpamCheckResult {
  const ip = getClientIP(request);
  
  // 1. Check honeypot field (should be empty)
  if (body.website || body.url || body.website_url) {
    return { isSpam: true, reason: 'Honeypot field filled' };
  }
  
  // 2. Check rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return { isSpam: true, reason: 'Rate limit exceeded' };
  }
  
  // 3. Check form submission time (if provided)
  if (formStartTime) {
    const submitTime = Date.now();
    const timeSpent = submitTime - formStartTime;
    if (timeSpent < MIN_FORM_TIME) {
      return { isSpam: true, reason: 'Form submitted too quickly' };
    }
  }
  
  // 4. Check for spam keywords in message/content fields
  const textFields = ['message', 'content', 'about', 'vision', 'biggestChallenge', 'whyPodcast'];
  for (const field of textFields) {
    if (body[field] && typeof body[field] === 'string') {
      if (containsSpamKeywords(body[field])) {
        return { isSpam: true, reason: 'Spam keywords detected' };
      }
      
      // Check for excessive links (more than 2 links is suspicious)
      const linkCount = countLinks(body[field]);
      if (linkCount > 2) {
        return { isSpam: true, reason: 'Too many links in message' };
      }
    }
  }
  
  // 5. Check email format and suspicious patterns
  if (body.email) {
    const email = body.email.toLowerCase();
    
    // Check for suspicious email patterns
    const suspiciousPatterns = [
      /^[a-z0-9]+@[a-z0-9]+\.[a-z]{2,3}$/i, // Too simple
      /\d{6,}/, // Many consecutive digits
    ];
    
    // Check for disposable email domains (basic check)
    const disposableDomains = ['tempmail', 'guerrillamail', 'mailinator', '10minutemail'];
    const emailDomain = email.split('@')[1];
    if (emailDomain && disposableDomains.some(domain => emailDomain.includes(domain))) {
      // Not blocking, just logging
      console.warn('Potential disposable email:', email);
    }
  }
  
  // 6. Check name field for suspicious patterns
  if (body.name) {
    const name = body.name.trim();
    // Names that are too short or contain only numbers
    if (name.length < 2 || /^\d+$/.test(name)) {
      return { isSpam: true, reason: 'Invalid name format' };
    }
    
    // Check for spam keywords in name
    if (containsSpamKeywords(name)) {
      return { isSpam: true, reason: 'Spam keywords in name' };
    }
  }
  
  return { isSpam: false };
}
