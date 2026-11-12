import Image from 'next/image';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { AI_SPRINT_PRICE } from '@/lib/site';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

/**
 * His core offer (added 2026-11-12): consultancy for any business on how to
 * put AI into it. The paid version of the free guide at /ai-guide, which is
 * the same five steps from his BNA 2026 deck; this walks a leadership team
 * through them for their own company.
 *
 * Same shape and price as the Constraint Sprint, by his choice. The
 * Constraint Sprint stays the offer for service businesses (productizing plus
 * AI integration); this one is for every other kind of business too.
 *
 * Every number on the page traces to the deck: 85%+ of division5's processes
 * automated, improvement cycles from months to weeks.
 */
const PRICE = AI_SPRINT_PRICE;

const sprintData = {
  name: 'The AI Integration Sprint',
  url: `${siteUrl}/ai-sprint`,
  provider: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
  },
  areaServed: 'Worldwide',
  description:
    'Four remote working sessions across two weeks with a business owner and their leadership team, to decide where AI belongs in the business and in what order, ending in a written AI integration plan.',
};

export const metadata: Metadata = createMetadata({
  title: 'The AI Integration Sprint',
  description:
    'AI integration consultancy for businesses: four remote sessions with your leadership team to map your processes and data, design the first AI agents, and leave with a written plan. Run by Engjell Rraklli.',
  path: '/ai-sprint',
});

/** The five steps of the guide, worked through over four sessions. */
const AGENDA = [
  {
    when: 'Session one',
    what: 'List the processes and where the hours go',
    detail:
      'Every recurring process across sales, marketing, operations, HR and finance, who does it today and what it costs in hours. We pick the few where AI pays back first.',
    homework: 'Each owner lists the data their processes depend on, and where it lives today.',
  },
  {
    when: 'Session two',
    what: 'Map the data',
    detail:
      'Where each kind of record really lives, and where there are two answers. This decides what has to be fixed before any AI goes in, and whether the system your team works in can carry it.',
    homework: 'List the decisions in those processes that follow a fixed rule every time, with no exceptions.',
  },
  {
    when: 'Session three',
    what: 'Design the agents',
    detail:
      'For each chosen process, which steps an agent reads, drafts and proposes, and who approves its work. The rule is the one we run on ourselves: AI proposes, a person decides.',
    homework: 'Name the person who will approve each agent, and check they have the time.',
  },
  {
    when: 'Session four',
    what: 'Decide the order',
    detail:
      'What becomes an automated workflow, what stays with an agent and a person, and the ninety days that get the first process running. With owners, and small enough to actually happen.',
    homework: null,
  },
];

const DELIVERABLES = [
  'A map of your processes, with the ones where AI pays back first marked',
  'A data map: where each record lives, and what to fix before anything else',
  'The first agents: what each one proposes, and who approves it',
  'A ninety day plan with owners and an order, including what it takes to keep it running',
];

const NOT_FOR = [
  'Anyone who wants a tool recommendation. I will not tell you which AI product to buy',
  'Companies that want a demo for the board rather than a change in how the work gets done',
  'Teams whose leadership will not clear four two-hour blocks',
  'Anyone who wants AI making decisions with no person checking them',
];

export default function AiSprintPage() {
  return (
    <main id="main-content">
      <StructuredData type="Service" data={sprintData} />
      <Breadcrumbs
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'AI Integration Sprint', url: `${siteUrl}/ai-sprint` },
        ]}
      />

      <PageHero
        label="AI consultancy"
        title={
          <>
            The AI Integration <span className="text-[var(--primary-mint)]">Sprint</span>
          </>
        }
        lede={
          <p>
            Four sessions over two weeks with you and the people who run your business, to decide where AI
            belongs in it and in what order. Run remotely, wherever you are. You leave with a written plan:
            your processes, where the data lives, the first agents and who approves them, and what to
            automate last.
          </p>
        }
        actions={
          <>
            <a href="#book" className="btn btn-primary">
              Tell me about your business
            </a>
            <Link href="/ai-guide" className="btn btn-secondary">
              Read the free guide first
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
              <li>A written AI integration plan</li>
            </ul>
          </div>
        }
      />

      <section className="sec-deep">
        <div className="wrap flex flex-wrap items-center gap-x-16 gap-y-10 py-[clamp(48px,5vw,72px)]">
          <div className="relative aspect-[4/3] w-full min-w-0 max-w-[560px] flex-[1_1_360px] overflow-hidden bg-[var(--deep)]">
            <Image
              src="/photos/studio-ringlight.jpg"
              alt="Engjell Rraklli in the podcast studio"
              fill
              quality={85}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 max-w-[40em] flex-[1_1_440px] text-[17px] leading-relaxed text-[var(--text)]">
            <p>
              At division5 we went from people running every process to more than 85% of them automated,
              and improving a process went from months to weeks. It did not start with AI. It started with
              listing the work, putting the data in one place and building one system, and only then adding
              agents and workflows.
            </p>
            <p className="mt-4">
              The{' '}
              <Link href="/ai-guide" className="text-link">
                free guide
              </Link>{' '}
              sets out that order. This sprint is for the companies that want to go through it with
              someone who has already done it, for their own business.
            </p>
          </div>
        </div>
      </section>

      <section className="sec-light" aria-labelledby="agenda">
        <div className="wrap pad-y">
          <SectionLabel>How the two weeks run</SectionLabel>
          <h2 id="agenda" className="h-section mt-3.5">
            Four sessions, with real work in between
          </h2>
          <p className="mt-5 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            Four sessions of about two hours, twice a week. The gaps are where your team checks the real
            processes and the real data, rather than describing them from memory.
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
            A plan you can build, in order
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
            Fixed, for all four sessions and the written plan afterwards. Run over video, so your timezone
            matters more than your address. The plan is yours to build with whoever you choose, including{' '}
            <a href="https://divisionai.co" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              divisionAI
            </a>
            , which builds these systems.
          </p>
        </div>
      </section>

      <section className="sec-deep" aria-labelledby="not-for">
        <div className="wrap pad-y">
          <SectionLabel>Who this is not for</SectionLabel>
          <h2 id="not-for" className="h-section mt-3.5">
            Four cases where I would tell you not to book
          </h2>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {NOT_FOR.map((n) => (
              <li key={n} className="flex gap-4 border-t border-[var(--line)] py-6">
                <X size={22} className="mt-0.5 shrink-0 text-[var(--secondary-orange)]" aria-hidden="true" />
                <span className="text-base leading-relaxed text-[var(--ink)]">{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            Run a service business? The{' '}
            <Link href="/sprint" className="text-link">
              Constraint Sprint
            </Link>{' '}
            covers productizing what you sell as well as where AI fits, because AI on top of work that is
            reinvented for every client only makes the mess run faster.
          </p>
        </div>
      </section>

      <section id="book" className="sec-dark" aria-labelledby="book-title">
        <div className="wrap pad-y flex flex-wrap gap-x-20 gap-y-10">
          <div className="min-w-0 flex-[1_1_400px]">
            <SectionLabel>Book</SectionLabel>
            <h2 id="book-title" className="h-section mt-3.5">
              Tell me about your business
            </h2>
            <p className="mt-5 max-w-[36em] text-[17px] leading-relaxed text-[var(--text)]">
              What you sell, roughly how many people you are, and where the hours go. A paragraph is enough.
              I will reply with whether I think a sprint is the right thing, and say so plainly when it is not.
            </p>
          </div>
          <div className="min-w-0 flex-[1_1_520px]">
            <ContactForm defaultTopic="AI integration sprint" />
          </div>
        </div>
      </section>
    </main>
  );
}
