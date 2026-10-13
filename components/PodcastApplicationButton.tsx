'use client';

import { useEffect, useState } from 'react';
import { Mic, X } from 'lucide-react';
import PodcastApplicationForm from '@/components/PodcastApplicationForm';

export default function PodcastApplicationButton() {
  const [open, setOpen] = useState(false);

  // Escape closes the dialog, and the page behind it stops scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary w-full">
        <Mic className="h-4 w-4 shrink-0" aria-hidden="true" />
        Apply to be a guest
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="podcast-apply-title"
            className="sec-dark relative my-8 w-full max-w-2xl border border-[var(--line)] border-t-[3px] border-t-[var(--primary-mint)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6 md:p-8">
              <PodcastApplicationForm onSuccess={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
