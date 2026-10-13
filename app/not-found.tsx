import Link from 'next/link';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

// 404s must not be indexed and must not canonicalize to the homepage.
export const metadata: Metadata = createMetadata({
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has been moved.',
  noindex: true,
});

const POPULAR = [
  { href: '/journal/how-to-scale-a-service-business-in-the-ai-era', label: 'How to scale a service business in the AI era' },
  { href: '/playbook', label: 'Productize and Scale, the free playbook' },
  { href: '/podcast', label: 'Scaling the Unscalable, the podcast' },
];

export default function NotFound() {
  return (
    <main id="main-content">
      <section className="sec-dark">
        <div className="wrap pad-y flex flex-wrap items-end gap-x-20 gap-y-10">
          <div className="min-w-0 flex-[1_1_480px]">
            <p className="font-bebas text-[clamp(140px,20vw,280px)] leading-[0.8] text-[var(--primary-mint)]">404</p>
            <h1 className="mt-4 text-[clamp(40px,4vw,60px)] leading-[0.96]">This page does not exist, or it moved.</h1>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/" className="btn btn-primary">
                Go home
              </Link>
              <Link href="/journal" className="btn btn-secondary">
                Browse the journal
              </Link>
            </div>
          </div>
          <div className="min-w-0 flex-[1_1_360px]">
            <p className="label">Most people come for</p>
            <ul className="mt-3 border-b border-[var(--line)]">
              {POPULAR.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="block border-t border-[var(--line)] py-4 font-semibold text-[var(--ink)] hover:text-[var(--primary-mint)]">
                    {p.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
