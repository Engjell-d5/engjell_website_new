import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ContactForm from '@/components/ContactForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

/**
 * The paid version of the playbook. Delivered remotely.
 *
 * A free document ending in six diagnostics creates a specific kind of reader:
 * one who agrees, starts, and stalls on the honesty the exercise requires. This
 * page is for them, and it is deliberately the only paid thing on the site.
 *
 * Remote is not a downgrade of an in-person format. Four spaced sessions beat
 * two consecutive days because the diagnostics need people to go and check real
 * things between them, and it removes the geographic ceiling on who can buy.
 *
 * PRICE is a single constant because it is the number most likely to change and
 * it should never need hunting for in the copy.
 */
const PRICE = '€3,500';

/**
 * Introductory, and said so on the page.
 *
 * The work justifies more. The evidence does not, yet: there are no case
 * studies for this specific service, and a free ten page playbook sits one
 * click away setting an anchor. A first buyer is paying partly to find out
 * whether it works, and the price should reflect that rather than pretend
 * otherwise.
 *
 * Naming it as introductory does two things a discount cannot. It creates a
 * real reason to move now instead of manufactured scarcity, and it makes the
 * later increase a stated plan rather than something a past client discovers
 * and resents.
 */
const PRICE_NOTE = 'Introductory rate for the first three engagements.';

const sprintData = {
  name: 'The Constraint Sprint',
  url: `${siteUrl}/sprint`,
  provider: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
  },
  areaServed: 'Worldwide',
  description:
    'Four remote working sessions across two weeks with a founder and their leadership team, to name the constraint the business is actually stuck on and leave with a written ninety day plan.',
};

export const metadata: Metadata = createMetadata({
  title: 'The Constraint Sprint',
  description:
    'Four remote sessions with your leadership team to name the constraint your service business is actually stuck on, and a written ninety day plan to clear it. Run by Engjell Rraklli.',
  path: '/sprint',
});

/**
 * Four sessions across two weeks rather than two consecutive days.
 *
 * Partly because nobody holds attention through two full days on video. Mostly
 * because these diagnostics need people to go and look at real things, and the
 * gap between sessions is where that happens. Asked in a room, "where did your
 * last ten clients come from" gets answered from memory, which is exactly the
 * flattering version the playbook warns about.
 */
const AGENDA = [
  {
    when: 'Session one',
    what: 'Map the work as it actually happens',
    detail:
      'Not the process diagram. The real one, including the workarounds nobody puts in writing. Your team does the talking and I ask the awkward questions.',
    homework: 'Each leader logs every decision that came to them, as it happens, for a week.',
  },
  {
    when: 'Session two',
    what: 'Find what only you can do',
    detail:
      'We go through that log together and sort it into context, authority and skill. Having the real week in front of us rather than a remembered one is the whole point of the gap.',
    homework: 'Pull the actual source of your last ten clients from the CRM, not from memory.',
  },
  {
    when: 'Session three',
    what: 'Re-sort the work',
    detail:
      'What genuinely needs a person, what needs a person who is trained, and what software can now carry. Most teams have not revisited that third bucket since 2023.',
    homework: 'Pick one candidate process and gather whatever data it currently depends on.',
  },
  {
    when: 'Session four',
    what: 'Decide the first ninety days',
    detail:
      'One constraint, one process, one source of work that is not referral. Sequenced, with owners, and small enough to actually happen.',
    homework: null,
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
  'Teams whose leadership will not clear four two-hour blocks, or will attend with a laptop open on something else',
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
            Four sessions over two weeks with you and the people who actually run your business,
            to name the thing it is stuck on and decide what to do about it. Run remotely, wherever
            you are. You leave with a written analysis and a ninety day plan.
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
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-meta)]">
              How the two weeks run
            </h2>
            <p className="mb-6 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              Four sessions of about two hours, twice a week. The gaps are not padding. Asked in a
              room, questions like where your last ten clients came from get answered from memory,
              which is the flattering version. The work between sessions is where the real answers
              come from.
            </p>
            <ol className="flex flex-col gap-6">
              {AGENDA.map((slot) => (
                <li key={slot.when} className="border-l-2 border-[var(--primary-mint)] pl-5">
                  <p className="mb-1 font-mono text-xs uppercase tracking-[0.14em] text-[var(--primary-mint)]">
                    {slot.when}
                  </p>
                  <p className="mb-1 font-semibold text-[var(--text-primary)]">{slot.what}</p>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{slot.detail}</p>
                  {slot.homework && (
                    <p className="mt-3 border-l-2 border-[var(--rule-faint)] pl-3 text-sm italic leading-relaxed text-[var(--text-meta)]">
                      Before the next one: {slot.homework}
                    </p>
                  )}
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
            <p className="mb-2 font-bebas text-5xl tracking-wide text-[var(--primary-mint)]">
              {PRICE}
            </p>
            <p className="mb-4 text-sm text-[var(--text-meta)]">{PRICE_NOTE}</p>
            <p className="max-w-[58ch] leading-relaxed text-[var(--text-muted)]">
              Fixed, for all four sessions and the written analysis afterwards. Run over video, so
              your timezone matters more than your address and there is no travel to pay for. If
              you decide after the first session that this is not going to be useful, we stop and
              you pay nothing. The rate goes up once there are results to point at, and I would
              rather say that than pretend the number is permanent.
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
