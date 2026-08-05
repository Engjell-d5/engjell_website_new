/**
 * Defences against the signup bot that put 35 disposable aliases on the list,
 * just under half of every subscriber the site had ever collected.
 *
 * Gmail ignores dots in the local part and everything after a plus sign, so
 * `g.al.leg.o.s.metti.f.h.3.49@gmail.com` and `galleggosmettifh349@gmail.com`
 * are the same mailbox. That gives a bot unlimited unique-looking addresses
 * against a unique-email constraint. The honeypot and timing check did not stop
 * it, because it was not filling the form quickly or touching hidden fields.
 *
 * Two independent measures here, because either alone is escapable:
 *   1. Canonicalise before storing, so one mailbox can occupy only one row.
 *   2. Reject the pattern outright, so the obvious ones never get that far.
 */

const GMAILISH = /^(gmail|googlemail)\.com$/;

/**
 * Reduces an address to the mailbox it actually reaches, so the unique
 * constraint does the work. Gmail only: for every other provider dots and plus
 * signs can be significant, and silently rewriting someone's address would lose
 * real subscribers.
 */
export function canonicalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at < 1) return trimmed;

  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!GMAILISH.test(domain)) return trimmed;

  const withoutTag = local.split('+')[0];
  const withoutDots = withoutTag.replace(/\./g, '');
  // Refuse to produce an empty local part from something like "...@gmail.com".
  return withoutDots ? `${withoutDots}@${domain}` : trimmed;
}

/**
 * True for addresses shaped like the bot's output rather than a person's.
 *
 * Kept deliberately narrow. A real subscriber writing `first.last@gmail.com`
 * has one dot and must never be caught; the observed bot addresses carried
 * three to nine, split into one and two character fragments.
 */
export function looksLikeBotAddress(email: string): boolean {
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return false;

  const local = e.slice(0, at);
  const domain = e.slice(at + 1);

  if (GMAILISH.test(domain) && (local.match(/\./g) || []).length >= 3) return true;
  // Three or more separate digit groups is a uniquifier, not a birth year.
  if ((local.match(/\d+/g) || []).length >= 3) return true;
  if (local.length >= 28) return true;

  return false;
}
