'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

/**
 * Application form for /invest.
 *
 * Posts to /api/contact rather than a new endpoint. That route already carries
 * the honeypot, the timing check, the per-IP rate limit and the bot-address
 * filter, and everything lands in one inbox. The structured answers are folded
 * into the message body, which is the same trick ContactForm uses for its topic
 * field — it keeps the enquiry readable without a schema change.
 *
 * The qualifying questions are deliberately concrete. "Tell me about your
 * business" produces a paragraph that could describe anything; asking for
 * monthly revenue and where the company operates produces an answer that can be
 * triaged in ten seconds.
 */

const GEOGRAPHIES = ['Albania', 'Kosovo', 'Both', 'Elsewhere'] as const;

const MODELS = [
  'Productized digital service',
  'High-ticket B2B product',
  'Neither exactly, explained below',
] as const;

const REVENUE = [
  'Pre-revenue',
  'Under €5k / month',
  '€5k – €20k / month',
  '€20k – €50k / month',
  'Over €50k / month',
] as const;

const EMPTY = {
  name: '',
  email: '',
  company: '',
  link: '',
  geography: '',
  model: '',
  revenue: '',
  business: '',
  ask: '',
  website: '', // Honeypot
};

export default function InvestForm() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [formStartTime] = useState(Date.now());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const body = [
      'Topic: Investment application',
      '',
      `Company: ${form.company}`,
      `Link: ${form.link || 'not given'}`,
      `Operates in: ${form.geography}`,
      `Model: ${form.model}`,
      `Revenue: ${form.revenue}`,
      '',
      'What the business does:',
      form.business,
      '',
      'What they want from me:',
      form.ask,
    ].join('\n');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: body,
          website: form.website,
          formStartTime,
        }),
      });

      const data = await response.json();
      if (response.ok) setSent(true);
      else setError(data.error || 'Failed to send application');
    } catch {
      setError(
        'Something went wrong on our side. Please try again, or email info@engjellrraklli.com directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="panel-inset relative flex flex-col items-center gap-4 p-10 text-center">
        <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[var(--primary-mint)]"></div>
        <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[var(--primary-mint)]"></div>
        <CheckCircle2 className="h-10 w-10 text-[var(--primary-mint)]" />
        <h3 className="font-bebas text-2xl tracking-wide text-white">APPLICATION RECEIVED</h3>
        <p className="max-w-xs text-sm font-light text-[var(--text-muted)]">
          I read these myself. If it is a fit you will hear from me within a week, and if it is
          not I will still tell you rather than leave you waiting.
        </p>
      </div>
    );
  }

  const field =
    'w-full field p-3 text-sm text-white font-montserrat disabled:opacity-50';

  return (
    <div className="panel-inset relative flex flex-col p-10">
      <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[var(--primary-mint)]"></div>
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[var(--primary-mint)]"></div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="invest-name" className="form-label">Your name</label>
            <input id="invest-name" name="name" type="text" autoComplete="name"
              value={form.name} onChange={handleChange} required disabled={loading}
              className={field} />
          </div>
          <div>
            <label htmlFor="invest-email" className="form-label">Email</label>
            <input id="invest-email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={handleChange} required disabled={loading}
              className={field} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="invest-company" className="form-label">Company</label>
            <input id="invest-company" name="company" type="text" autoComplete="organization"
              value={form.company} onChange={handleChange} required disabled={loading}
              className={field} />
          </div>
          <div>
            <label htmlFor="invest-link" className="form-label">
              Website or deck <span className="text-[var(--text-meta)]">(optional)</span>
            </label>
            <input id="invest-link" name="link" type="text" inputMode="url"
              placeholder="https://"
              value={form.link} onChange={handleChange} disabled={loading}
              className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="invest-geography" className="form-label">Where do you operate?</label>
          <select id="invest-geography" name="geography" value={form.geography}
            onChange={handleChange} required disabled={loading} className={field}>
            <option value="" disabled>Select</option>
            {GEOGRAPHIES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="invest-model" className="form-label">Which describes you better?</label>
          <select id="invest-model" name="model" value={form.model}
            onChange={handleChange} required disabled={loading} className={field}>
            <option value="" disabled>Select</option>
            {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="invest-revenue" className="form-label">Monthly revenue today</label>
          <select id="invest-revenue" name="revenue" value={form.revenue}
            onChange={handleChange} required disabled={loading} className={field}>
            <option value="" disabled>Select</option>
            {REVENUE.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="invest-business" className="form-label">
            What does the business do, and who pays for it?
          </label>
          <textarea id="invest-business" name="business" rows={4}
            value={form.business} onChange={handleChange} required disabled={loading}
            className={`${field} resize-none`} />
        </div>

        <div>
          <label htmlFor="invest-ask" className="form-label">
            What do you actually need? Be specific.
          </label>
          <textarea id="invest-ask" name="ask" rows={3}
            value={form.ask} onChange={handleChange} required disabled={loading}
            className={`${field} resize-none`} />
        </div>

        {/* Honeypot: hidden from people, filled in by naive bots. */}
        <input type="text" name="website" value={form.website} onChange={handleChange}
          tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }} />

        {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          <Send className="h-4 w-4" />
          {loading ? 'Sending…' : 'Send application'}
        </button>
      </form>
    </div>
  );
}
