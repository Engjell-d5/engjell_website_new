import { NextRequest } from 'next/server';
import { rateLimit, getClientIdentifier } from './rate-limit';

// Two distinct outcomes, deliberately kept apart:
//
//   'drop': we believe this is a bot. Callers answer 200 so the bot learns
//   nothing, and the submission is thrown away.
//
//   'rate-limited': a human is going too fast. Callers MUST answer 429 with a
//   real message. Answering 200 here (the previous behaviour) silently
//   destroyed genuine contact messages: the visitor saw "Message sent" and
//   nobody ever received it.
export type SpamVerdict =
  | { action: 'allow' }
  | { action: 'drop'; reason: string }
  | { action: 'rate-limited'; reason: string; retryAfterSeconds: number };

// Per-form buckets. These used to share one 5-per-15-minutes counter, so
// subscribing to the newsletter used up the contact form's budget.
const LIMITS = {
  contact: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  subscribe: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  podcast: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
} as const;

export type FormKind = keyof typeof LIMITS;

const MIN_FORM_TIME = 3000; // A human needs at least 3s to fill a form

// Spam keywords to check for
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'lottery', 'winner', 'prize',
  'click here', 'buy now', 'limited time', 'act now', 'urgent',
  'make money', 'work from home', 'get rich', 'free money',
  'nigerian prince', 'inheritance', 'lottery winner'
];

function containsSpamKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/[^\s]+/gi);
  return matches ? matches.length : 0;
}

export function checkSpam(
  request: NextRequest,
  body: any,
  formStartTime?: number,
  kind: FormKind = 'contact'
): SpamVerdict {
  // 1. Honeypot field (must be empty), strongest bot signal, check first so
  //    bots never consume a rate-limit slot that belongs to a real visitor.
  if (body.website || body.url || body.website_url) {
    return { action: 'drop', reason: 'Honeypot field filled' };
  }

  // 2. Form filled out impossibly fast
  if (formStartTime) {
    const timeSpent = Date.now() - formStartTime;
    if (timeSpent < MIN_FORM_TIME) {
      return { action: 'drop', reason: 'Form submitted too quickly' };
    }
  }

  // 3. Spam keywords / link stuffing in free-text fields
  const textFields = ['message', 'content', 'about', 'vision', 'biggestChallenge', 'whyPodcast'];
  for (const field of textFields) {
    const value = body[field];
    if (typeof value === 'string' && value) {
      if (containsSpamKeywords(value)) {
        return { action: 'drop', reason: 'Spam keywords detected' };
      }
      if (countLinks(value) > 2) {
        return { action: 'drop', reason: 'Too many links in message' };
      }
    }
  }

  // 4. Obviously fake name
  if (body.name) {
    const name = String(body.name).trim();
    if (name.length < 2 || /^\d+$/.test(name)) {
      return { action: 'drop', reason: 'Invalid name format' };
    }
    if (containsSpamKeywords(name)) {
      return { action: 'drop', reason: 'Spam keywords in name' };
    }
  }

  // 5. Log (never block) disposable-address signups
  if (typeof body.email === 'string') {
    const emailDomain = body.email.toLowerCase().split('@')[1];
    const disposableDomains = ['tempmail', 'guerrillamail', 'mailinator', '10minutemail'];
    if (emailDomain && disposableDomains.some(domain => emailDomain.includes(domain))) {
      console.warn('Potential disposable email:', body.email);
    }
  }

  // 6. Rate limit last, only submissions that look human get here, and this
  //    is reported to the caller as a retryable condition, not as spam.
  const options = LIMITS[kind];
  const result = rateLimit(`${kind}:${getClientIdentifier(request)}`, options);
  if (!result.allowed) {
    return {
      action: 'rate-limited',
      reason: 'Rate limit exceeded',
      retryAfterSeconds: Math.max(1, Math.ceil((result.resetTime - Date.now()) / 1000)),
    };
  }

  return { action: 'allow' };
}
