import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PlaybookCta from '@/components/PlaybookCta';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

// A standalone URL exists so the playbook can be linked from LinkedIn, a
// podcast description or an email signature without sending people through a
// 3,800 word article first. The in-article CTA catches readers; this catches
// everyone else.
// StructuredData supplies @context and @type, so neither belongs here.
const playbookData = {
  name: 'Scaling a Service Business with AI',
  author: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
  },
  inLanguage: 'en',
  url: `${siteUrl}/playbook`,
  encodingFormat: 'application/pdf',
  isAccessibleForFree: true,
  description:
    'A ten page working playbook with six diagnostics for founders of service businesses who are still the bottleneck their business queues behind.',
};

export const metadata: Metadata = createMetadata({
  title: 'The Scaling Playbook',
  description:
    'A free ten page playbook for service business founders. Six diagnostics to find the constraint you are, re-sort what actually needs a person, and put AI in the right order.',
  path: '/playbook',
});

const CONTENTS = [
  ['The bottleneck has your name on it', 'What stops when you stop, and which of the three reasons it is.'],
  ['Re-sort every recurring task', 'Three buckets. The third one grew and almost nobody updated their list.'],
  ['What actually changed, and what did not', 'The cost of a first draft went to zero. Judgement did not.'],
  ['The order is the whole thing', 'Four steps. Starting at step four is the expensive mistake.'],
  ['When word of mouth runs out', 'Referral is not a channel. It is a ceiling with good manners.'],
  ['Culture carries all of it', 'If software does the junior work, the path that made your seniors is gone.'],
];

export default function PlaybookPage() {
  return (
    <>
      <StructuredData type="DigitalDocument" data={playbookData} />
      <Breadcrumbs items={[{ name: 'Home', url: siteUrl }, { name: 'Playbook', url: `${siteUrl}/playbook` }]} />

      <div className="mx-auto w-full max-w-[80rem] px-4 py-12 md:py-16 lg:flex lg:gap-12">
        <main className="w-full lg:max-w-[46rem]">
          <p className="section-label mb-4">Free playbook</p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl">
            Scaling a service business with AI
          </h1>

          <p className="mb-6 max-w-[62ch] text-lg leading-relaxed text-[var(--text-secondary)]">
            In May 2015 I founded division5 in Albania. I was 23, with no connections, no money,
            no references and no experience. A decade of growing it taught me that whatever was
            blocking the company was almost always something that existed only in my head.
          </p>

          <p className="mb-10 max-w-[62ch] leading-relaxed text-[var(--text-muted)]">
            This is what was left after a decade of that. Six diagnostics, each ending with
            something you answer in writing, because a diagnostic you do in your head is one you
            flatter yourself through. At the end you will have a named constraint, a re-sorted list
            of what genuinely needs a person, and a first ninety days that does not start with
            buying software.
          </p>

          <div className="mb-10 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-meta)]">
              What is inside
            </h2>
            <ul className="flex flex-col gap-5">
              {CONTENTS.map(([title, note]) => (
                <li key={title} className="flex gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-[var(--primary-mint)]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{title}</p>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">{note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <PlaybookCta variant="page" />

          <p className="mt-10 leading-relaxed text-[var(--text-muted)]">
            The playbook came out of{' '}
            <Link
              href="/journal/how-to-scale-a-service-business-in-the-ai-era"
              className="text-[var(--primary-mint)] hover:underline"
            >
              this article
            </Link>
            , which is the story rather than the work. Read that first if you want to know whether
            any of this is worth your hour.
            <ArrowRight size={16} className="ml-1 inline" aria-hidden="true" />
          </p>

          {/* The paid path, mentioned once and after the free thing has been
              given away. Someone who has read this far is the only person the
              sprint is for. */}
          <p className="mt-6 leading-relaxed text-[var(--text-muted)]">
            If you would rather not do the diagnostics alone, I run them with leadership teams
            remotely over two weeks as{' '}
            <Link href="/sprint" className="text-[var(--primary-mint)] hover:underline">
              the Constraint Sprint
            </Link>
            . That is the paid version, and the playbook is genuinely enough for plenty of people.
          </p>
        </main>

        <div className="mt-16 lg:mt-0 lg:flex-1">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
