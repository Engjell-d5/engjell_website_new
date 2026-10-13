import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';

/**
 * The hub behind "Work with me" in the header. The three offers used to be
 * reachable only from the footer and from each other; this is the one page
 * that lays them side by side, says who each is for, and points everyone
 * else at the contact form.
 */
export const metadata: Metadata = createMetadata({
  title: 'Work with Engjell Rraklli',
  description:
    'Three ways to work with Engjell Rraklli: the Constraint Sprint for service business founders, talks for event organisers, and angel investment in Albania and Kosovo.',
  path: '/work',
});

const OFFERS = [
  {
    href: '/sprint',
    image: '/photos/studio-desk.jpg',
    for: 'For service business founders',
    title: 'The Constraint Sprint',
    body: 'Four remote sessions over two weeks with you and the people who actually run your business, to name the thing it is stuck on and decide what to do about it. You leave with a written analysis and a ninety day plan.',
    facts: ['€7,500 fixed', 'Four sessions, two weeks, remote', 'Stop after session one and pay nothing'],
    go: 'How the sprint works',
  },
  {
    href: '/speaking',
    image: '/photos/stage-adc-wide.jpg',
    for: 'For organisers and podcast hosts',
    title: 'Speaking',
    body: 'Talks about what actually happened when we put AI agents into a real business: what they took over, what we refused to let them touch, and what it cost. Post-mortems, not predictions.',
    facts: ['Conference talks and panels', 'Half-day workshops', 'Podcast guest spots'],
    go: 'Topics and bios',
  },
  {
    href: '/invest',
    image: '/photos/adc-listening.jpg',
    for: 'For founders in Albania and Kosovo',
    title: 'Angel investing',
    body: 'I back B2B productized services, services turned into software and high-ticket B2B products, built here and already selling in Europe or the US. Customers, distribution and automation come with the cheque.',
    facts: ['No fund, no committee', 'Directly or through my ventures', 'An answer within a week'],
    go: 'What I invest in',
  },
];

export default function WorkPage() {
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Work with me', url: '/work' }]} />

      <PageHero
        label="Work with me"
        size="md"
        title={
          <>
            Three ways to <span className="text-[var(--primary-mint)]">work together</span>
          </>
        }
        lede={
          <p>
            Everything here comes out of running my own companies, so each offer is narrow on purpose.
            If none of them fits what you need, tell me anyway.
          </p>
        }
        actions={
          <Link href="/contact" className="btn btn-secondary">
            Something else? Get in touch
          </Link>
        }
      />

      {OFFERS.map((o, i) => (
        <section key={o.href} className={i % 2 === 0 ? 'sec-deep' : 'sec-light'} aria-labelledby={`offer-${i}`}>
          <div className={`wrap flex flex-wrap items-center gap-x-16 gap-y-10 py-[clamp(56px,6vw,96px)] ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
            <div className="relative aspect-[4/3] w-full min-w-0 flex-[1_1_420px] overflow-hidden bg-[var(--deep)]">
              <Image src={o.image} alt="" fill quality={85} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="min-w-0 flex-[1_1_440px]">
              <SectionLabel>{o.for}</SectionLabel>
              <h2 id={`offer-${i}`} className="mt-3.5 text-[clamp(46px,4.8vw,72px)] leading-[0.94]">
                {o.title}
              </h2>
              <p className="mt-5 max-w-[36em] text-[17px] leading-relaxed text-[var(--text)]">{o.body}</p>
              <ul className="mt-6 flex flex-col gap-2 border-t border-[var(--line)] pt-5">
                {o.facts.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px] font-semibold text-[var(--ink)]">
                    <span className="block h-2 w-2 shrink-0 bg-[var(--primary-mint)]" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={o.href} className={`btn mt-8 ${i % 2 === 1 ? 'btn-dark' : 'btn-primary'}`}>
                {o.go}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      ))}

      <section className="sec-mint">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-6 py-[clamp(48px,5vw,80px)]">
          <h2 className="max-w-[16em] text-balance text-[clamp(38px,3.8vw,58px)] leading-[0.96]">
            Not sure which? Write to me and I will tell you straight.
          </h2>
          <Link href="/contact" className="btn btn-dark">
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}
