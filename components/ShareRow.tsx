'use client';

import { useState } from 'react';
import { Linkedin, Link2, Check } from 'lucide-react';

// Share affordance for journal posts: X, LinkedIn, and copy-link. Square and
// outlined like every other secondary action, and it reads its colours from
// the surface it sits on.
export default function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (http / old browser): fall back to prompt
      window.prompt('Copy this link:', url);
    }
  };

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=RraklliEngjell`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const btn =
    'inline-flex min-h-[40px] items-center gap-2 border border-[var(--line)] px-3.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--primary-mint)] hover:text-[var(--accent-text)]';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={liHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on LinkedIn">
        <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
        LinkedIn
      </a>
      <a href={xHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
        <span aria-hidden="true" className="text-[13px] font-bold leading-none">X</span>
      </a>
      <button type="button" onClick={copy} className={btn} aria-label="Copy link">
        {copied ? <Check className="h-3.5 w-3.5 text-[var(--accent-text)]" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
