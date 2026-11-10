'use client';

import { useState } from 'react';
import { Mic, Send } from 'lucide-react';

/**
 * Guest application for Scaling the Unscalable.
 *
 * Rebuilt 2026-11-10. The old form asked for eight required fields, six of
 * them open text boxes ("Your vision", "Tell me about yourself"), and had
 * received zero applications. This asks for what a host actually needs to
 * decide: who you are, where to look, which of the two Season 2 formats
 * fits, and one question that is the show's idea in miniature. A Teardown
 * applicant is also exactly who the Constraint Sprint is for.
 */

export const GUEST_FORMATS = {
  conversation: {
    label: 'Conversation',
    hint: 'My company runs without me, and I can explain how it got there.',
  },
  teardown: {
    label: 'Teardown',
    hint: "I'm still the bottleneck. Diagnose it with me on camera.",
  },
} as const;

export type GuestFormat = keyof typeof GUEST_FORMATS;

interface PodcastApplicationFormProps {
  onSuccess?: () => void;
}

const EMPTY = { name: '', email: '', link: '', format: 'conversation' as GuestFormat, story: '', website: '' };

export default function PodcastApplicationForm({ onSuccess }: PodcastApplicationFormProps) {
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [formStartTime] = useState(Date.now());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/podcast/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, formStartTime }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSent(true);
        setFormData(EMPTY);
        onSuccess?.();
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const story =
    formData.format === 'teardown'
      ? 'What is the one part of your company that still only works because you are there?'
      : 'What is the one part of your company that stopped needing you, and how did it get there?';

  return (
    <div>
      <div className="mb-7 border-b border-[var(--line-soft)] pb-5 pr-10">
        <p className="label flex items-center gap-2">
          <Mic className="h-4 w-4 text-[var(--primary-mint)]" aria-hidden="true" />
          Scaling the Unscalable
        </p>
        <h2 id="podcast-apply-title" className="mt-2 text-[40px] leading-none tracking-[0.03em]">
          Apply to be a guest
        </h2>
      </div>

      {sent ? (
        <div role="status" className="space-y-3">
          <p className="text-xl font-bold text-[var(--ink)]">Thank you, it&apos;s in.</p>
          <p className="text-base leading-relaxed text-[var(--text)]">
            I read every application myself and reply within a week.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="guest-name" className="form-label">Name</label>
              <input
                type="text"
                id="guest-name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full field p-3 text-sm font-montserrat disabled:opacity-50"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="guest-email" className="form-label">Email</label>
              <input
                type="email"
                id="guest-email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full field p-3 text-sm font-montserrat disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="guest-link" className="form-label">Your company website or LinkedIn</label>
            <input
              type="text"
              inputMode="url"
              id="guest-link"
              name="link"
              autoComplete="url"
              placeholder="yourcompany.com"
              value={formData.link}
              onChange={handleChange}
              required
              className="w-full field p-3 text-sm font-montserrat disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <fieldset>
            <legend className="form-label">Which episode fits you?</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(Object.keys(GUEST_FORMATS) as GuestFormat[]).map((key) => {
                const f = GUEST_FORMATS[key];
                const checked = formData.format === key;
                return (
                  <label
                    key={key}
                    className={`block cursor-pointer border p-4 transition-colors ${
                      checked ? 'border-[var(--primary-mint)]' : 'border-[var(--line)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="format"
                        value={key}
                        checked={checked}
                        onChange={handleChange}
                        disabled={loading}
                        className="accent-[var(--primary-mint)]"
                      />
                      <span className="font-bold text-[var(--ink)]">{f.label}</span>
                    </span>
                    <span className="mt-1.5 block text-[14px] leading-snug text-[var(--text)]">{f.hint}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="guest-story" className="form-label">{story}</label>
            <textarea
              id="guest-story"
              name="story"
              value={formData.story}
              onChange={handleChange}
              required
              minLength={20}
              rows={4}
              placeholder="A few sentences is plenty."
              className="w-full field p-3 text-sm resize-none font-montserrat disabled:opacity-50"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            <Send className="w-4 h-4" />
            {loading ? 'Sending…' : 'Send application'}
          </button>

          {/* Honeypot: hidden from people, filled in by bots. */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px' }}
            aria-hidden="true"
          />
          {error && (
            <p role="alert" className="text-sm mt-2 text-[var(--secondary-orange)]">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
