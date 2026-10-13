import Link from 'next/link';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PlaybookCta, { PlaybookCover } from '@/components/PlaybookCta';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

// A standalone URL exists so the playbook can be linked from LinkedIn, a
// podcast description or an email signature without sending people through a
// 3,800 word article first. The in-article CTA catches readers; this catches
// everyone else.
// StructuredData supplies @context and @type, so neither belongs here.
const playbookData = {
  name: 'Productize and Scale',
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
    'An eleven page working playbook for founders of service businesses. Eight steps to turn work that is reinvented for every client into something repeatable that runs without you, each ending in something you have to compile.',
};

export const metadata: Metadata = createMetadata({
  title: 'Productize and Scale',
  description:
    'A free working playbook for service business founders. Eight steps to productize what you sell, find where the work really comes from, and put AI in the right order rather than first.',
  path: '/playbook',
});

// Mirrors the eight steps in the PDF. If the document changes, this changes with
// it: a lead magnet page that promises different contents to the asset is worse
// than no page at all.
const CONTENTS = [
  ['What you actually sell', 'The offer you have already sold twice is the one the market voted for.'],
  ['Who pays, and from where', 'Your last ten customers, by country and by how they really found you.'],
  ['How the work really happens', 'Not the process diagram. The one with the workarounds in it.'],
  ['Where the work comes from', 'Referral is not a channel. It is a ceiling with good manners.'],
  ['What only you can do', 'What stops when you stop, and which of the three reasons it is.'],
  ['One clean version of your numbers', 'Four rows. Any row with two answers breaks the next step.'],
  ['Only now, automate', 'Starting here is the expensive mistake. It makes the mess run faster.'],
  ['The next ninety days', 'One constraint, one process, one channel. Owners and dates against each.'],
];

export default function PlaybookPage() {
  return (
    <main id="main-content">
      <StructuredData type="DigitalDocument" data={playbookData} />
      <Breadcrumbs items={[{ name: 'Home', url: siteUrl }, { name: 'Playbook', url: `${siteUrl}/playbook` }]} />

      <PageHero
        label="Free playbook · 11 pages"
        title={
          <>
            Productize <span className="text-[var(--primary-mint)]">and Scale</span>
          </>
        }
        lede={
          <>
            <p>
              In May 2015 I founded division5 in Albania. I was 23, with no connections, no money, no
              references and no experience. A decade of growing it taught me that whatever was blocking the
              company was almost always something that existed only in my head.
            </p>
            <div className="mt-8">
              <PlaybookCta variant="form" />
            </div>
          </>
        }
        aside={
          <div className="flex justify-center py-4">
            <PlaybookCover />
          </div>
        }
      />

      <section className="sec-light" aria-labelledby="inside">
        <div className="wrap pad-y">
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
            <div>
              <SectionLabel>What is inside</SectionLabel>
              <h2 id="inside" className="h-section mt-3.5">
                Eight steps, each ending in something you write down
              </h2>
            </div>
            <p className="max-w-[30em] text-[15px] leading-relaxed text-[var(--text)]">
              A question you answer in your head is one you flatter yourself through. You finish with your
              own document, not a set of ideas.
            </p>
          </div>
          <ol className="mt-12 grid gap-x-12 sm:grid-cols-2">
            {CONTENTS.map(([title, note], i) => (
              <li key={title} className="flex gap-6 border-t border-[var(--line)] py-7">
                <span className="font-bebas text-[44px] leading-none text-[var(--accent-text)]" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[30px] leading-[1.02] tracking-[0.03em]">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--text)]">{note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec-deep">
        <div className="wrap flex flex-wrap gap-x-20 gap-y-8 py-[clamp(56px,6vw,96px)]">
          <div className="min-w-0 flex-[1_1_480px]">
            <SectionLabel>Where it came from</SectionLabel>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text)]">
              The playbook came out of{' '}
              <Link href="/journal/how-to-scale-a-service-business-in-the-ai-era" className="text-link">
                this essay
              </Link>
              , which is the story rather than the work. Read that first if you want to know whether any of
              this is worth your hour.
            </p>
          </div>
          <div className="min-w-0 flex-[1_1_480px]">
            <SectionLabel>Rather not do it alone?</SectionLabel>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text)]">
              I run the same diagnostics with leadership teams, remotely over two weeks, as{' '}
              <Link href="/sprint" className="text-link">
                the Constraint Sprint
              </Link>
              . That is the paid version, and the playbook is genuinely enough for plenty of people.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
