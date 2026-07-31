'use client';

import { useId, useState } from 'react';
import { Mail } from 'lucide-react';

// Single subscribe implementation. There used to be three near-identical
// copies (this file, SubscribeFormInline, and a private one inside Sidebar)
// which had already drifted: the sidebar copy sent neither the honeypot nor
// formStartTime, so it was the one unprotected entry point.
export type SubscribeVariant = 'card' | 'inline';

// Deliberately no cadence promise. Actual publishing runs at roughly one post
// a month with gaps; "weekly" was a promise the journal does not keep, and a
// broken cadence promise costs more trust than a vague one.
const PITCH =
  'Field notes on building and scaling a service business — sent when there is something worth reading. No spam, unsubscribe anytime.';

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
      className={`text-[10px] mt-2 ${variant === 'inline' ? 'text-center' : ''} ${
        status.ok ? 'text-[var(--primary-mint)]' : 'text-red-400'
      }`}
    >
      {status.text}
    </p>
  );

  const inputClass =
    'w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white transition-all font-montserrat disabled:opacity-50';

  if (variant === 'inline') {
    return (
      <div className="blog-subscribe-snippet-inline my-8 flex flex-col items-center">
        <form onSubmit={handleSubmit} className="flex items-center w-full max-w-md">
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} border-r-0 h-12`}
            required
            disabled={loading}
          />
          {honeypot}
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-6 bg-[var(--primary-mint)] hover:bg-white text-black font-bold transition-all tracking-[0.15em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border border-[var(--border-color)] border-l-0 flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {loading ? 'Subscribing...' : 'Join'}
          </button>
        </form>
        {statusLine}
      </div>
    );
  }

  return (
    <div className="blog-subscribe-snippet">
      <div className="bg-[var(--rich-black)] border border-[var(--border-color)] p-6">
        <h4 className="text-xl text-white font-bebas tracking-wide mb-3">SUBSCRIBE</h4>
        <p className="text-xs text-[var(--text-meta)] leading-relaxed mb-4 font-light">{PITCH}</p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
            disabled={loading}
          />
          {honeypot}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary-mint)] hover:bg-white text-black font-bold py-4 transition-all tracking-[0.15em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {loading ? 'Subscribing...' : 'Join'}
          </button>
          {statusLine}
        </form>
      </div>
    </div>
  );
}
