'use client';

import { useId, useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';

/**
 * Email gate for the scaling playbook, embedded inside journal posts.
 *
 * Posts to /api/subscribe, the same endpoint as SubscribeForm, so a download
 * puts the person on the list and syncs to Sender.net with no new plumbing.
 * It sends the honeypot and formStartTime because checkSpam expects both; the
 * sidebar copy of the subscribe form once omitted them and was the one
 * unprotected entry point on the site.
 *
 * A 409 means "already subscribed". For a newsletter that is an error worth
 * showing. For a lead magnet it is not: the person wants the file, and they
 * are already on the list, so both parties get what they came for. Treating it
 * as failure would deny the document to exactly the people who like the writing
 * most.
 *
 * The gate is soft on purpose. The PDF stays at a plain URL that anyone can
 * share, and that is the right trade for a personal site whose problem is
 * distribution rather than leakage.
 */

export const PLAYBOOK_PDF = '/downloads/scaling-a-service-business-with-ai.pdf';

const TITLE = 'Productize and Scale';
const BLURB =
  'Eight steps for turning a service business into something that runs without you, from eleven years of building one in Albania. Written to be worked through rather than read: every step ends in something you have to compile.';

export default function PlaybookCta({ variant = 'inline' }: { variant?: 'inline' | 'page' }) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [formStartTime] = useState(Date.now());
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const inputId = useId();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, formStartTime }),
      });

      // 409 is "already subscribed" — still a successful download.
      if (res.ok || res.status === 409) {
        setState('done');
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong. Please try again.');
      setState('error');
    } catch {
      setError('Something went wrong. Please try again.');
      setState('error');
    }
  };

  const heading = variant === 'page' ? 'text-3xl md:text-4xl' : 'text-2xl';

  return (
    <aside
      className="my-12 rounded-lg border border-[var(--border-color)] bg-[var(--panel-bg)] p-6 md:p-8"
      style={{ borderLeft: '3px solid var(--primary-mint)' }}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-mint)]">
        Free playbook
      </p>
      <h2 className={`${heading} mb-3 font-bold leading-tight text-[var(--text-primary)]`}>
        {TITLE}
      </h2>
      <p className="mb-6 max-w-[58ch] leading-relaxed text-[var(--text-muted)]">{BLURB}</p>

      {state === 'done' ? (
        <div>
          <p className="mb-4 text-[var(--text-muted)]">
            Here it is. It is also on the way to your inbox.
          </p>
          <a
            href={PLAYBOOK_PDF}
            download
            className="inline-flex items-center gap-2 rounded-md bg-[var(--primary-mint)] px-6 py-3 font-semibold text-[var(--rich-black)] transition-opacity hover:opacity-90"
          >
            <Download size={18} aria-hidden="true" />
            Download the PDF
          </a>

          {/* The one moment worth mentioning the paid version: they have just
              committed to reading it, and this is the only screen where that is
              true. Deliberately quiet, and after the download rather than
              instead of it. */}
          <p className="mt-6 border-t border-[var(--rule-faint)] pt-4 text-sm leading-relaxed text-[var(--text-meta)]">
            If you would rather work through it with your team than alone, I run the same
            diagnostics remotely over two weeks.{' '}
            <a href="/sprint" className="text-[var(--primary-mint)] hover:underline">
              The Constraint Sprint
            </a>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <label htmlFor={inputId} className="sr-only">
            Your email address
          </label>
          <input
            id={inputId}
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full flex-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-dark)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-meta)] focus:border-[var(--primary-mint)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-mint)]/30"
          />
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[var(--primary-mint)] px-6 py-3 font-semibold text-[var(--rich-black)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === 'sending' ? 'Sending' : 'Send it to me'}
            {state !== 'sending' && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </form>
      )}

      {state === 'error' && (
        <p role="alert" className="mt-3 text-sm text-[var(--secondary-orange)]">
          {error}
        </p>
      )}

      {state !== 'done' && (
        <p className="mt-4 text-xs text-[var(--text-meta)]">
          Your email gets you the playbook and the occasional post. Nothing else, unsubscribe anytime.
        </p>
      )}
    </aside>
  );
}
