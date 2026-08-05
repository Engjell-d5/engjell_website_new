/**
 * Forwards new newsletter subscribers to the D5 management app.
 *
 * Inert until D5_SUBSCRIBER_SYNC_PATH is set, so this ships safely before the
 * backend endpoint exists rather than posting into a 404 on every signup.
 *
 * The one-off import of the existing 72 subscribers already ran. This keeps the
 * CRM in step from here on, so the list does not silently drift again.
 *
 * Consent is the thing to be careful about. These people opted into a personal
 * newsletter, not into agency outreach, so every contact the backend creates
 * must carry processingRestricted=true. That flag is enforced at campaign send
 * time in the D5 backend, which makes it a real guard rather than a note. The
 * site cannot set it, so the endpoint has to.
 */

const BASE_URL = process.env.PUBLIC_API_BASE_URL;
const API_KEY = process.env.PUBLIC_API_KEY;
const SYNC_PATH = process.env.D5_SUBSCRIBER_SYNC_PATH;

/**
 * Best-effort. Never throws, never blocks the subscribe response.
 *
 * A CRM that is briefly out of date is a minor problem; a signup form that
 * errors because a downstream system is down is a real one. The subscriber row
 * and the Sender.net sync are what actually matter at signup time.
 */
export async function syncSubscriberToCrm(email: string): Promise<void> {
  if (!SYNC_PATH || !BASE_URL || !API_KEY) return;

  // PUBLIC_API_BASE_URL is the bare origin (https://app.division5.co) with no
  // version segment, which is why the task integration writes
  // `${PUBLIC_API_BASE_URL}/api/v1/tasks/public`. Tolerate either form so a
  // later change to the variable cannot silently produce /api/v1/api/v1.
  const origin = BASE_URL.replace(/\/+$/, '');
  const versioned = /\/api\/v\d+$/.test(origin) ? origin : `${origin}/api/v1`;
  const url = `${versioned}/${SYNC_PATH.replace(/^\/+/, '')}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify({ email, source: 'engjellrraklli.com newsletter' }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[crm-sync] ${res.status} for subscriber sync`);
    }
  } catch (error: any) {
    console.error('[crm-sync] failed:', error?.message || error);
  }
}
