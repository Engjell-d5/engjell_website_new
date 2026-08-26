/**
 * Forwards contact and invest submissions to the D5 management app, so the
 * things people send actually surface where the team works. The decision
 * (2026-08-26) followed finding eight submissions sitting unread in this
 * site's own admin, the newest two weeks old; the local row remains the
 * fallback copy, this makes the app the primary surface.
 *
 * Spam control is layered BEFORE this runs: the /api/contact route's
 * honeypot, timing check, rate limit and bot-address check all fire first,
 * and the D5 endpoint applies its own throttle, email guard and
 * content-shape gate on top. This function only ever sees what passed.
 *
 * Best-effort like crm-sync: never throws, never blocks the visitor's
 * response. A CRM briefly missing one message is a minor problem; a
 * contact form that errors because a downstream system is down is a real
 * one. The local save is what matters at submit time.
 */

const BASE_URL = process.env.PUBLIC_API_BASE_URL;
const API_KEY = process.env.PUBLIC_API_KEY;

export interface D5ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message: string;
  source: 'engjellrraklli.com contact' | 'engjellrraklli.com invest';
}

export async function forwardContactToD5(payload: D5ContactPayload): Promise<void> {
  if (!BASE_URL || !API_KEY) return;

  const origin = BASE_URL.replace(/\/+$/, '');
  const versioned = /\/api\/v\d+$/.test(origin) ? origin : `${origin}/api/v1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${versioned}/contact-requests/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[d5-forward] ${res.status} forwarding ${payload.source}`);
    }
  } catch (error: any) {
    console.error('[d5-forward] failed:', error?.message || error);
  }
}

/**
 * The site's forms collect one name field; D5 stores two. First word
 * becomes the first name, the rest the last name, and a single-word name
 * gets '-' as the last name because D5 requires one. Imperfect by nature:
 * this is a display split, not an identity claim.
 */
export function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || '-';
  const lastName = parts.slice(1).join(' ') || '-';
  return { firstName, lastName };
}
