'use client';

import { useId, useState } from 'react';

// Single subscribe implementation. There used to be three near-identical
// copies (this file, SubscribeFormInline, and a private one inside Sidebar)
// which had already drifted: the sidebar copy sent neither the honeypot nor
// formStartTime, so it was the one unprotected entry point.
export type SubscribeVariant = 'card' | 'inline';

// Deliberately no cadence promise. Actual publishing runs at roughly one post
// a month with gaps; "weekly" was a promise the journal does not keep, and a
// broken cadence promise costs more trust than a vague one.
const PITCH =
  'Field notes on building and scaling a service business, sent when there is something worth reading. No spam, unsubscribe anytime.';

export default function SubscribeForm({ variant = 'card' }: { variant?: SubscribeVariant }) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [formStartTime] = useState(Date.now()); // Track when form was loaded
  const inputId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, formStartTime }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ ok: true, text: "You're subscribed. Talk soon." });
        setEmail('');
        setWebsite('');
      } else {
        setStatus({ ok: false, text: data.error || 'Failed to subscribe' });
      }
    } catch (error) {
      setStatus({ ok: false, text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const honeypot = (
    <input
      type="text"
      name="website"
      value={website}
      onChange={(e) => setWebsite(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      style={{ position: 'absolute', left: '-9999px' }}
      aria-hidden="true"
    />
  );

  // role="status" so assistive tech announces the outcome; it was previously
  // conveyed by colour alone.
  const statusLine = status && (
    <p
      role="status"
      className={`meta mt-2 ${status.ok ? 'text-[var(--accent-text)]' : 'text-[var(--secondary-orange)]'}`}
    >
      {status.text}
    </p>
  );

  const form = (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-wrap gap-2">
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="field min-h-[48px] min-w-0 flex-[1_1_200px] px-4 text-sm disabled:opacity-50"
        required
        disabled={loading}
      />
      {honeypot}
      <button type="submit" disabled={loading} className="btn btn-primary min-h-[48px] px-5">
        {loading ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );

  if (variant === 'inline') {
    return (
      <div className="blog-subscribe-snippet-inline mt-4 flex flex-col items-start">
        {form}
        {statusLine}
      </div>
    );
  }

  return (
    <div className="blog-subscribe-snippet">
      <div className="panel-inset p-7">
        <p className="label">
          <span className="slash">/</span>Field notes by email
        </p>
        <p className="mb-4 mt-2 max-w-[46ch] text-sm leading-relaxed text-[var(--text)]">{PITCH}</p>
        {form}
        {statusLine}
      </div>
    </div>
  );
}
