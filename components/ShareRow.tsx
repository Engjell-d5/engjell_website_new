'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Link2, Check } from 'lucide-react';

// Share affordance for journal posts: X, LinkedIn, and copy-link.
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
    'flex items-center gap-2 px-3 py-2 border border-[var(--border-color)] text-[var(--text-meta)] hover:text-[var(--primary-mint)] hover:border-[var(--primary-mint)] text-[10px] font-bold uppercase tracking-widest transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold text-[var(--text-meta)] uppercase tracking-widest mr-1">Share</span>
      <a href={xHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
        <Twitter className="w-3.5 h-3.5" />
        X
      </a>
      <a href={liHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on LinkedIn">
        <Linkedin className="w-3.5 h-3.5" />
        LinkedIn
      </a>
      <button type="button" onClick={copy} className={btn} aria-label="Copy link">
        {copied ? <Check className="w-3.5 h-3.5 text-[var(--primary-mint)]" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
