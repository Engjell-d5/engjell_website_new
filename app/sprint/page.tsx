import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ContactForm from '@/components/ContactForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

/**
 * The paid version of the playbook.
 *
 * A free document ending in six diagnostics creates a specific kind of reader:
 * one who agrees, starts, and stalls on the honesty the exercise requires. This
 * page is for them, and it is deliberately the only paid thing on the site.
 *
 * PRICE is a single constant because it is the number most likely to change and
 * it should never need hunting for in the copy.
 */
const PRICE = '€7,500';

const sprintData = {
  name: 'The Constraint Sprint',
  url: `${siteUrl}/sprint`,
  provider: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
  },
  areaServed: 'Europe',
  description:
    'A two day working session with a founder and their leadership team to name the constraint the business is actually stuck on, and leave with a written ninety day plan.',
};

export const metadata: Metadata = createMetadata({
  title: 'The Constraint Sprint',
  description:
    'Two days with your leadership team to name the constraint your service business is actually stuck on, and a written ninety day plan to clear it. Run by Engjell Rraklli.',
  path: '/sprint',
});

const AGENDA = [
  {
    when: 'Day one, morning',
    what: 'Map the work as it actually happens',
    detail:
      'Not the process diagram. The real one, including the workarounds nobody puts in writing. Your team does the talking and I ask the awkward questions.',
  },
  {
    when: 'Day one, afternoon',
    what: 'Find what only you can do',
    detail:
      'Every decision from the last month that could not have happened without the founder, sorted into context, authority and skill. This is usually the uncomfortable part.',
  },
  {
    when: 'Day two, morning',
    what: 'Re-sort the work',
    detail:
      'What genuinely needs a person, what needs a person who is trained, and what software can now carry. Most teams have not revisited that third bucket since 2023.',
  },
  {
    when: 'Day two, afternoon',
    what: 'Decide the first ninety days',
    detail:
      'One constraint, one process, one source of work that is not referral. Sequenced, with owners, and small enough to actually happen.',
  },
];

const DELIVERABLES = [
  'A written constraint analysis, the honest version rather than the flattering one',
  'Your work re-sorted into what needs you, what needs training, and what software can carry',
  'A ninety day plan with owners and an order, not a backlog',
  'The one thing I would do first if it were my company, and why',
];

const NOT_FOR = [
  'Anyone who wants a vendor evaluation. I will not tell you which tool to buy',
  'Companies under about ten people, where the founder is meant to be the bottleneck',
  'Teams where the leadership will not sit in the room for two days',
  'Anyone who needs the answer to be that nothing has to change',
];

export default function SprintPage() {
  return (
    <>
      <StructuredData type="ProfilePage" data={sprintData} />
      <Breadcrumbs
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Constraint Sprint', url: `${siteUrl}/sprint` },
        ]}
      />

      <div className="mx-auto w-full max-w-[80rem] px-4 py-12 md:py-16 lg:flex lg:gap-12">
        <main id="main-content" className="w-full lg:max-w-[46rem]">
          <p className="section-label mb-4">Working session</p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl">
            The Constraint Sprint
          </h1>

          <p className="mb-6 max-w-[62ch] text-lg leading-relaxed text-[var(--text-secondary)]">
            Two days with you and the people who actually run your business, to name the thing it
            is stuck on and decide what to do about it. You leave with a written analysis and a
            ninety day plan.
          </p>

          <p className="mb-10 max-w-[62ch] leading-relaxed text-[var(--text-muted)]">
            The{' '}
            <Link href="/playbook" className="text-[var(--primary-mint)] hover:underline">
              playbook
            </Link>{' '}
            is the free version and it is genuinely enough for some people. This is for the ones
            who started it, got to the second diagnostic, and found that answering honestly about
            your own company is harder alone than it looks on paper.
          </p>

          {/* Agenda */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-meta)]">
              What the two days look like
            </h2>
            <ol className="flex flex-col gap-6">
              {AGENDA.map((slot) => (
                <li key={slot.when} className="border-l-2 border-[var(--primary-mint)] pl-5">
                  <p className="mb-1 font-mono text-xs uppercase tracking-[0.14em] text-[var(--primary-mint)]">
                    {slot.when}
                  </p>
                  <p className="mb-1 font-semibold text-[var(--text-primary)]">{slot.what}</p>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{slot.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Deliverables */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-meta)]">
              What you leave with
            </h2>
            <ul className="flex flex-col gap-3">
              {DELIVERABLES.map((d) => (
                <li key={d} className="flex gap-3">
                  <Check
                    size={18}
                    className="mt-1 shrink-0 text-[var(--primary-mint)]"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed text-[var(--text-muted)]">{d}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Price */}
          <section className="mb-12 border border-[var(--border-color)] bg-[var(--panel-bg)] p-8">
            <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[var(--text-meta)]">
              Price
            </p>
            <p className="mb-4 font-bebas text-5xl tracking-wide text-[var(--primary-mint)]">
              {PRICE}
            </p>
            <p className="max-w-[58ch] leading-relaxed text-[var(--text-muted)]">
              Fixed, for the two days and the written analysis afterwards. Remote or in person,
              and travel within Europe is included. If you decide during the first morning that
              this is not going to be useful, we stop and you pay nothing.
            </p>
          </section>

          {/* Disqualifier. The most trustworthy part of any offer page. */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-meta)]">
              Who this is not for
            </h2>
            <p className="mb-6 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              Saying yes to everyone is how consulting gets its reputation. Four cases where I
              would tell you not to book.
            </p>
            <ul className="flex flex-col gap-3">
              {NOT_FOR.map((n) => (
                <li key={n} className="flex gap-3">
                  <X
                    size={18}
                    className="mt-1 shrink-0 text-[var(--secondary-orange)]"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed text-[var(--text-muted)]">{n}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Enquiry */}
          <section id="book" className="border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">
              Tell me what you are stuck on
            </h2>
            <p className="mb-8 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              A paragraph is enough. I will reply with whether I think a sprint is the right thing,
              and I will say so plainly when it is not. There is no call before the call.
            </p>
            <ContactForm defaultTopic="Constraint sprint" />
          </section>
        </main>

        <div className="mt-16 lg:mt-0 lg:flex-1">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
