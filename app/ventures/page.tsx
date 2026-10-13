import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { VENTURES } from '@/lib/ventures';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';
const FOUNDER = {
  '@type': 'Person',
  '@id': `${siteUrl}/#person`,
  name: 'Engjell Rraklli',
  url: siteUrl,
} as const;

export const metadata: Metadata = createMetadata({
  title: 'division5 & divisionAI',
  description:
    "Engjell Rraklli's companies: division5, a staffing marketplace for vetted AI-native Balkan engineers, and divisionAI, business systems with AI agents inside them. Built in Tirana.",
  path: '/ventures',
});

// What each company is for, in a line, beyond the one-line description the
// Organization schema carries.
const DETAIL: Record<string, string> = {
  division5:
    'Started in May 2015 with no money and no network, selling software development services because that is what kept the company alive. Today it places vetted AI-native engineers from across the Balkans with companies in Europe and beyond, selected for skill and fit.',
  divisionAI:
    'The software underneath the operation, with AI inside it rather than bolted on the side. Agents carry the assembly work, and a person still approves every decision that leaves the building. It is how a recruitment function that took five people now runs with two.',
};

export default function Ventures() {
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Ventures', url: '/ventures' }]} />
      {VENTURES.map((v) => (
        <StructuredData
          key={v.name}
          type="Organization"
          data={{
            name: v.name,
            url: v.url,
            // Same string the page renders, so schema and page never diverge.
            description: v.description,
            founder: FOUNDER,
          }}
        />
      ))}

      <PageHero
        label="Ventures"
        size="md"
        title={
          <>
            What I <span className="text-[var(--primary-mint)]">build</span>
          </>
        }
        lede={
          <p>
            Two companies in Tirana. One places engineers with companies across Europe; the other builds
            the systems that let a small team run like a large one.
          </p>
        }
      />

      {VENTURES.map((v, i) => (
        <section key={v.name} className={i % 2 === 0 ? 'sec-light' : 'sec-deep'} aria-labelledby={`venture-${i}`}>
          <div className="wrap pad-y flex flex-wrap items-end gap-x-20 gap-y-8">
            <div className="min-w-0 flex-[1_1_520px]">
              <SectionLabel>
                {v.role} since {v.since}
              </SectionLabel>
              {/* Brand names keep their own casing, so not Bebas here. */}
              <h2
                id={`venture-${i}`}
                className="mt-4 font-montserrat text-[clamp(56px,7vw,112px)] font-extrabold leading-[0.9] tracking-[-0.03em]"
              >
                {v.name}
              </h2>
              <p className="mt-6 max-w-[34em] text-[clamp(18px,1.5vw,22px)] font-medium leading-snug text-[var(--ink)]">
                {v.description}
              </p>
            </div>
            <div className="min-w-0 flex-[1_1_380px]">
              <p className="text-[17px] leading-relaxed text-[var(--text)]">{DETAIL[v.name]}</p>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn mt-7 ${i % 2 === 0 ? 'btn-dark' : 'btn-primary'}`}
              >
                Visit {v.name}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      ))}

      <section className="sec-dark">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-6 py-[clamp(56px,6vw,88px)]">
          <p className="max-w-[30em] text-[17px] leading-relaxed text-[var(--text)]">
            The story of how both came to exist, including the years spent trying to escape the first one,
            is on the About page.
          </p>
          <Link href="/about" className="link-rule">
            Read my story
          </Link>
        </div>
      </section>
    </main>
  );
}
