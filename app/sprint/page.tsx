import Link from 'next/link';
import { Check, X } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

/**
 * The paid version of the playbook. Delivered remotely.
 *
 * A free document ending in eight steps creates a specific kind of reader:
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
const PRICE = '€7,500';

/**
 * Typed as a Service, not a ProfilePage.
 *
 * It was a ProfilePage, which Search Console flagged as "Missing field
 * mainEntity", correctly, because ProfilePage describes a profile OF someone
 * and requires the person as its mainEntity. This page sells a thing. A service
 * with a provider is what it actually is, and it needs no mainEntity.
 */
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
    <main id="main-content">
      <StructuredData type="Service" data={sprintData} />
      <Breadcrumbs
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Constraint Sprint', url: `${siteUrl}/sprint` },
        ]}
      />

      <PageHero
        label="Working session"
        title={
          <>
            The Constraint <span className="text-[var(--primary-mint)]">Sprint</span>
          </>
        }
        lede={
          <p>
            Four sessions over two weeks with you and the people who actually run your business, to name
            the thing it is stuck on and decide what to do about it. Run remotely, wherever you are. You
            leave with a written analysis and a ninety day plan.
          </p>
        }
        actions={
          <>
            <a href="#book" className="btn btn-primary">
              Tell me what you are stuck on
            </a>
            <Link href="/playbook" className="btn btn-secondary">
              Read the free playbook first
            </Link>
          </>
        }
        aside={
          <div className="border border-[var(--line)] border-t-[3px] border-t-[var(--primary-mint)] p-8">
            <p className="label">Fixed price</p>
            <p className="mt-2 font-bebas text-[84px] leading-none text-[var(--primary-mint)]">{PRICE}</p>
            <ul className="mt-5 flex flex-col gap-2.5 border-t border-[var(--line)] pt-5 text-[15px] font-semibold text-[var(--ink)]">
              <li>Four sessions of about two hours</li>
              <li>Two weeks, run over video</li>
              <li>A written analysis and a ninety day plan</li>
              <li className="text-[var(--accent-text)]">Not useful after session one? You pay nothing.</li>
            </ul>
          </div>
        }
      />

      <section className="sec-deep">
        <div className="wrap py-[clamp(48px,5vw,72px)]">
          <p className="max-w-[52em] text-[17px] leading-relaxed text-[var(--text)]">
            The{' '}
            <Link href="/playbook" className="text-link">
              playbook
            </Link>{' '}
            is the free version and it is genuinely enough for some people. This is for the ones who
            started it, got to the second diagnostic, and found that answering honestly about your own
            company is harder alone than it looks on paper.
          </p>
        </div>
      </section>

      <section className="sec-light" aria-labelledby="agenda">
        <div className="wrap pad-y">
          <SectionLabel>How the two weeks run</SectionLabel>
          <h2 id="agenda" className="h-section mt-3.5">
            Four sessions, with real work in between
          </h2>
          <p className="mt-5 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            Four sessions of about two hours, twice a week. The gaps are not padding. Asked in a room,
            questions like where your last ten clients came from get answered from memory, which is the
            flattering version. The work between sessions is where the real answers come from.
          </p>
          <ol className="mt-12 grid gap-x-12 md:grid-cols-2">
            {AGENDA.map((slot, i) => (
              <li key={slot.when} className="border-t border-[var(--line)] py-8">
                <p className="font-bebas text-[20px] tracking-[0.08em] text-[var(--accent-text)]">
                  {String(i + 1).padStart(2, '0')} · {slot.when}
                </p>
                <h3 className="mt-2 text-[clamp(30px,2.6vw,38px)] leading-[1.02] tracking-[0.03em]">{slot.what}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--text)]">{slot.detail}</p>
                {slot.homework && (
                  <p className="mt-4 border-l-2 border-[var(--accent-text)] pl-4 text-sm leading-relaxed text-[var(--muted)]">
                    <span className="font-semibold text-[var(--ink)]">Before the next one:</span> {slot.homework}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec-dark" aria-labelledby="leave-with">
        <div className="wrap pad-y">
          <SectionLabel>What you leave with</SectionLabel>
          <h2 id="leave-with" className="h-section mt-3.5">
            Written down, owned, and in order
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DELIVERABLES.map((d) => (
              <li key={d} className="card">
                <Check size={22} className="text-[var(--primary-mint)]" aria-hidden="true" />
                <p className="text-[15px] leading-relaxed text-[var(--ink)]">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec-mint" aria-labelledby="price">
        <div className="wrap flex flex-wrap items-center gap-x-16 gap-y-6 py-[clamp(56px,6vw,96px)]">
          <p id="price" className="font-bebas text-[clamp(96px,12vw,180px)] leading-[0.85] text-[var(--rich-black)]">
            {PRICE}
          </p>
          <p className="max-w-[38em] flex-[1_1_420px] text-[17px] font-medium leading-relaxed text-[var(--rich-black)]">
            Fixed, for all four sessions and the written analysis afterwards. Run over video, so your
            timezone matters more than your address and there is no travel to pay for. If you decide after
            the first session that this is not going to be useful, we stop and you pay nothing.
          </p>
        </div>
      </section>

      <section className="sec-deep" aria-labelledby="not-for">
        <div className="wrap pad-y">
          <SectionLabel>Who this is not for</SectionLabel>
          <h2 id="not-for" className="h-section mt-3.5">
            Four cases where I would tell you not to book
          </h2>
          <p className="mt-5 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            Saying yes to everyone is how consulting gets its reputation.
          </p>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {NOT_FOR.map((n) => (
              <li key={n} className="flex gap-4 border-t border-[var(--line)] py-6">
                <X size={22} className="mt-0.5 shrink-0 text-[var(--secondary-orange)]" aria-hidden="true" />
                <span className="text-base leading-relaxed text-[var(--ink)]">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="book" className="sec-dark" aria-labelledby="book-title">
        <div className="wrap pad-y flex flex-wrap gap-x-20 gap-y-10">
          <div className="min-w-0 flex-[1_1_400px]">
            <SectionLabel>Book</SectionLabel>
            <h2 id="book-title" className="h-section mt-3.5">
              Tell me what you are stuck on
            </h2>
            <p className="mt-5 max-w-[36em] text-[17px] leading-relaxed text-[var(--text)]">
              A paragraph is enough. I will reply with whether I think a sprint is the right thing, and I
              will say so plainly when it is not. There is no call before the call.
            </p>
          </div>
          <div className="min-w-0 flex-[1_1_520px]">
            <ContactForm defaultTopic="Constraint sprint" />
          </div>
        </div>
      </section>
    </main>
  );
}
