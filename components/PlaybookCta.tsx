'use client';

import { useId, useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import SectionLabel from '@/components/site/SectionLabel';

/**
 * Email gate for the scaling playbook.
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
 *
 * Variants:
 *  - "section": a full light section with the cover, for the homepage and the
 *    foot of /playbook.
 *  - "inline":  a compact card for the end of an article.
 *  - "form":    the form alone, for the /playbook hero.
 */

export const PLAYBOOK_PDF = '/downloads/scaling-a-service-business-with-ai.pdf';

const TITLE = 'Productize and Scale';
const BLURB =
  'Eight steps to turn work you reinvent for every client into something that runs without you. Every step ends in something you have to write down, because a question answered in your head is one you flatter yourself through.';

function PlaybookForm({ dark = false }: { dark?: boolean }) {
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

      // 409 is "already subscribed", still a successful download.
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

  if (state === 'done') {
    return (
      <div>
        <p className="text-[var(--text)]">Here it is. It is also on the way to your inbox.</p>
        <a href={PLAYBOOK_PDF} download className={`btn mt-4 ${dark ? 'btn-primary' : 'btn-dark'}`}>
          <Download size={18} aria-hidden="true" />
          Download the PDF
        </a>
        {/* The one moment worth mentioning the paid version: they have just
            committed to reading it, and this is the only screen where that is
            true. Deliberately quiet, and after the download rather than
            instead of it. */}
        <p className="mt-6 max-w-[52ch] border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--muted)]">
          If you would rather work through it with your team than alone, I run the same diagnostics
          remotely over two weeks.{' '}
          <a href="/sprint" className="text-link">
            The Constraint Sprint
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[560px]">
      <label htmlFor={inputId} className="form-label">
        Where should I send it?
      </label>
      <div className="flex flex-wrap gap-2.5">
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field min-h-[54px] min-w-0 flex-[1_1_260px] px-[18px] text-[15px]"
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
          className={`btn min-h-[54px] ${dark ? 'btn-primary' : 'btn-dark'}`}
        >
          {state === 'sending' ? 'Sending' : 'Send it to me'}
          {state !== 'sending' && <ArrowRight size={17} aria-hidden="true" />}
        </button>
      </div>
      {state === 'error' && (
        <p role="alert" className="mt-3 text-sm text-[var(--secondary-orange)]">
          {error}
        </p>
      )}
      <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">
        You get the playbook and the occasional essay. Nothing else, and you can unsubscribe anytime.
      </p>
    </form>
  );
}

/** The document, drawn: rich black cover on a mint offset. Decorative. */
export function PlaybookCover({ className = 'w-full max-w-[280px]' }: { className?: string }) {
  return (
    <div className={`relative aspect-[3/4] ${className}`} aria-hidden="true">
      <div className="absolute inset-0 translate-x-[14px] translate-y-[14px] bg-[var(--primary-mint)]" />
      <div className="absolute inset-0 flex flex-col border border-[rgba(229,229,229,0.12)] bg-[var(--rich-black)] p-[26px] text-[#E5E5E5]">
        <img src="/Engjell_Rraklli_White_Logo_Mark.svg" alt="" className="h-[34px] w-[34px]" />
        <p className="mt-5 font-bebas text-[42px] leading-[0.95] tracking-[0.03em] text-white">
          Productize <span className="text-[var(--primary-mint)]">and</span> Scale
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[#CBD5E1]">
          Eight steps to turn a service business into something that runs without you.
        </p>
        <p className="mt-auto text-[10px] font-bold uppercase tracking-[0.16em] text-[#8FA5AE]">Engjell Rraklli</p>
      </div>
    </div>
  );
}

export default function PlaybookCta({ variant = 'inline' }: { variant?: 'inline' | 'section' | 'form' | 'page' }) {
  if (variant === 'form') return <PlaybookForm dark />;

  if (variant === 'section' || variant === 'page') {
    return (
      <section id="playbook" className="sec-light" aria-labelledby="playbook-title">
        <div className="wrap pad-y flex flex-wrap items-center gap-x-20 gap-y-12">
          <div className="min-w-0 flex-[1_1_480px]">
            <SectionLabel className="!text-[var(--accent-text)]">Free playbook · 11 pages</SectionLabel>
            <h2 id="playbook-title" className="mt-3.5 text-[clamp(52px,5.4vw,84px)] leading-[0.92]">
              {TITLE}
            </h2>
            <p className="lede mt-5 max-w-[34em]">{BLURB}</p>
            <div className="mt-8">
              <PlaybookForm />
            </div>
          </div>
          <div className="flex min-w-0 flex-[0_1_320px] justify-center">
            <PlaybookCover />
          </div>
        </div>
      </section>
    );
  }

  // Inline: the end of an article. Dark card, so it stands apart from the
  // light reading surface it sits on.
  return (
    <aside className="sec-deep my-12 border-t-[3px] border-[var(--primary-mint)] p-7 md:p-10" aria-labelledby="playbook-inline">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-8">
        <div className="min-w-0 flex-[1_1_340px]">
          <SectionLabel>Free playbook · 11 pages</SectionLabel>
          <h2 id="playbook-inline" className="mt-3 text-[clamp(36px,3.4vw,48px)] leading-[0.95]">
            Do the work this essay describes
          </h2>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-[var(--text)]">
            {TITLE} turns the argument into eight steps, each ending in something you have to write
            down. You finish with your own document, and a first ninety days that does not start with
            buying software.
          </p>
          <div className="mt-6">
            <PlaybookForm dark />
          </div>
        </div>
        <PlaybookCover className="hidden w-[170px] shrink-0 md:block" />
      </div>
    </aside>
  );
}
