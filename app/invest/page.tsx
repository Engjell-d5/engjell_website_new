import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import InvestForm from '@/components/InvestForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { VENTURES } from '@/lib/ventures';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

/**
 * Angel investing, Albania and Kosovo.
 *
 * The name is not a gimmick: engjëll is the Albanian word for angel. The
 * headline states it and nothing after it comments on it. An earlier draft
 * followed up with a line about it being the one joke the name allows, which
 * explained the joke and killed it. If the reader gets it they get it, and if
 * they do not, the page still says what it invests in.
 *
 * No terms on the page. Cheque size, stake and structure are not published
 * because they have not been decided in public, and inventing them here would
 * be worse than their absence. Add a Terms section when the numbers are real.
 *
 * SEO/GEO: every H2 is phrased as the question a founder would actually type,
 * which is also how a model retrieves. The FAQ schema below mirrors those H2s
 * verbatim so an assistant answering "who invests in Albanian B2B startups" has
 * a clean, attributable block to lift.
 */

const investData = {
  name: 'Angel investment by Engjell Rraklli',
  serviceType: 'Angel investment',
  url: `${siteUrl}/invest`,
  // Investment comes from Engjell directly or through the ventures, so all
  // three are providers. Reading the ventures from lib/ventures.ts means
  // retiring or adding one cannot leave this page claiming a company that no
  // longer exists.
  provider: [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Engjell Rraklli',
    },
    ...VENTURES.map((v) => ({
      '@type': 'Organization',
      name: v.name,
      url: v.url,
    })),
  ],
  areaServed: [
    { '@type': 'Country', name: 'Albania' },
    { '@type': 'Country', name: 'Kosovo' },
  ],
  description:
    'Angel investment in B2B productized digital services and high-ticket B2B products built in Albania or Kosovo and already selling to paying customers in Europe or the US. Invested by Engjell Rraklli directly or through his ventures, division5 and divisionAI, and coming with customer introductions, distribution, and help streamlining and automating delivery.',
};

/**
 * Mirrors the H2s on the page. Kept as one array so the visible copy and the
 * structured data cannot drift apart.
 */
const FAQ = [
  {
    q: 'What does Engjell Rraklli invest in?',
    a: 'Two things. B2B productized digital services, meaning a service sold like a product with fixed scope, fixed price and repeatable delivery. And high-ticket B2B products, meaning something sold to other businesses at a price that justifies a real sales conversation rather than a checkout button.',
  },
  {
    q: 'Where do you invest?',
    a: 'Built in Albania or Kosovo, sold abroad. The company and its team operate here; the customers are in Europe or the US and are already paying. A business whose customers are only local is a different kind of company to the one I can help.',
  },
  {
    q: 'What do you look for?',
    a: 'Revenue that already exists, however small, because it proves somebody is willing to pay. Delivery that repeats rather than being reinvented per client. A founder who can say plainly what the business is stuck on. And paying customers already in Europe or the US, not a plan to sell there — the business should be built in Albania or Kosovo and sold abroad.',
  },
  {
    q: 'Who is actually investing?',
    a: 'Engjell Rraklli directly, or one of his ventures, division5 and divisionAI. Which of the three depends on what the business needs, and it is settled per deal rather than decided in advance.',
  },
  {
    q: 'What do you bring besides money?',
    a: 'Four things. Access to the customers division5 and divisionAI already work with, and the network around them. Help with distribution, which is getting in front of buyers repeatably rather than closing every deal personally. Help streamlining delivery so the same work is not reinvented for every client. And then automating what is left, with software underneath the operation. In that order, because automating a process nobody has straightened out first only makes the mess run faster.',
  },
  {
    q: 'Who should not apply?',
    a: 'Consumer apps. Agencies billing purely by the hour with no productized offer. Companies selling only to local customers in Albania or Kosovo. Anything with no paying customers yet. And founders looking for a passive cheque with no involvement.',
  },
];

const faqSchema = {
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export const metadata: Metadata = createMetadata({
  title: 'Angel Investing in Albania and Kosovo',
  description:
    'Engjell Rraklli invests in B2B productized digital services and high-ticket B2B products built in Albania or Kosovo and already selling in Europe or the US. Customers, distribution and automation come with the cheque.',
  path: '/invest',
});

/**
 * The non-cash half of the offer. Listed separately from the prose because for
 * most founders reading this it is the more valuable half, and burying it in a
 * paragraph reads like modesty rather than substance.
 */
const BRINGS = [
  {
    title: 'Customers and the network around them',
    body: 'Introductions to the companies we already work with through division5 and divisionAI, and to the people around them. Warm, and to someone who can actually decide, which is the only kind of introduction worth making.',
  },
  {
    title: 'Distribution',
    body: 'The hard part of a productized service is almost never building it. It is getting in front of buyers repeatably, without the founder personally closing every deal. That is the problem I have spent the longest on and the one most companies here are actually stuck on.',
  },
  {
    title: 'Streamlining how you deliver',
    body: 'Turning work that is reinvented per client into something that runs the same way every time. It is what makes a service business worth owning rather than worth working at, and it is a prerequisite for everything below it.',
  },
  {
    title: 'Automating what is left',
    body: 'Once delivery is consistent it can be automated, and that is what divisionAI does — software underneath the operation, with AI inside it rather than bolted on the side. In that order, because automating a process nobody has straightened out first just makes the mess run faster.',
  },
];

const LOOKING_FOR = [
  'Revenue that already exists, however small. It proves somebody is willing to pay, which is the only evidence that counts',
  'Delivery that repeats. The same thing sold twice beats a bespoke project sold once, every time',
  'A founder who can name what the business is stuck on without rehearsing it first',
  'Customers already abroad, in Europe or the US. Not a plan to sell there — paying customers there now. The first foreign customer is a completely different problem to the tenth, and I want you past the first',
];

const NOT_FOR = [
  'Consumer apps. I would be guessing, and you deserve better than my guess',
  'Agencies billing purely by the hour with nothing productized. That is a job, not a business you can sell',
  'Companies selling only to Albanian or Kosovar customers. Good businesses, wrong investor — the ceiling is the local economy and I cannot lift it for you',
  'Ideas with no paying customers yet. Come back when someone abroad has paid, or when someone has said no for a reason you understand',
  'Anyone who wants a passive cheque. If money alone were enough, you would not need me specifically',
];

export default function InvestPage() {
  return (
    <>
      <StructuredData type="Service" data={investData} />
      <StructuredData type="FAQPage" data={faqSchema} />
      <Breadcrumbs
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Invest', url: `${siteUrl}/invest` },
        ]}
      />

      <div className="mx-auto w-full max-w-[80rem] px-4 py-12 md:py-16 lg:flex lg:gap-12">
        <main id="main-content" className="w-full lg:max-w-[46rem]">
          <p className="section-label mb-4">Angel investing</p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-[var(--text-primary)] md:text-5xl">
            Engjëll means angel.
          </h1>

          <p className="mb-6 max-w-[62ch] text-lg leading-relaxed text-[var(--text-secondary)]">
            I back B2B productized digital services and high-ticket B2B products built in{' '}
            <strong className="text-[var(--text-primary)]">Albania and Kosovo</strong>.
          </p>

          <p className="mb-10 max-w-[62ch] leading-relaxed text-[var(--text-muted)]">
            I am not a fund and there is no committee. Investment comes from me directly or through
            my ventures,{' '}
            <Link href="/ventures" className="text-[var(--primary-mint)] hover:underline">
              division5 and divisionAI
            </Link>
            , and which of those it is depends on what the business actually needs. I have built one
            service business here since 2015 and I know exactly which parts of that were avoidable.
            Most of what I can offer is the shortcut through those parts.
          </p>

          {/* What */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">
              What I invest in
            </h2>
            <div className="flex flex-col gap-8">
              <div className="border-l-2 border-[var(--primary-mint)] pl-5">
                <p className="mb-2 font-semibold text-[var(--text-primary)]">
                  B2B productized digital services
                </p>
                <p className="max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
                  A service sold like a product. Fixed scope, fixed price, delivered the same way
                  every time. The test is simple: if your second client costs you materially less to
                  serve than your first, you are productized. If every project starts from a blank
                  page, you are not, and that is the first thing worth fixing.
                </p>
              </div>
              <div className="border-l-2 border-[var(--primary-mint)] pl-5">
                <p className="mb-2 font-semibold text-[var(--text-primary)]">
                  High-ticket B2B products
                </p>
                <p className="max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
                  Something sold to other businesses at a price that justifies a real sales
                  conversation rather than a checkout button. High ticket matters because it forgives
                  a small market. You do not need a million users in a country of three million
                  people; you need a few hundred customers who are genuinely better off.
                </p>
              </div>
            </div>
          </section>

          {/* Where */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
              Built here, sold abroad
            </h2>
            <p className="mb-4 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              The company and the team operate in Albania or Kosovo. The customers do not — they are
              in <strong className="text-[var(--text-primary)]">Europe or the US</strong>, and they
              are already paying. Not a plan to expand there, not a pilot, revenue.
            </p>
            <p className="mb-4 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              This is the hardest filter on the page and the one I will not move on. A company
              selling only locally is capped by an economy of a few million people, and the work of
              landing the first customer in Berlin or Chicago is not something I can do on your
              behalf. Once you have proven you can, doing it repeatably is exactly what I am useful
              for.
            </p>
            <p className="max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              Albania exports its best people. Everything I have built here is a bet that it does
              not have to, and this is the same bet with a different instrument.
            </p>
          </section>

          {/* Criteria */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">What I look for</h2>
            <ul className="flex flex-col gap-3">
              {LOOKING_FOR.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check size={18} className="mt-1 shrink-0 text-[var(--primary-mint)]" aria-hidden="true" />
                  <span className="leading-relaxed text-[var(--text-muted)]">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Beyond money */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-4 text-2xl font-bold text-[var(--text-primary)]">
              What I bring besides money
            </h2>
            <p className="mb-8 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              I founded{' '}
              <Link href="/ventures" className="text-[var(--primary-mint)] hover:underline">
                division5
              </Link>{' '}
              in 2015 and spent the decade since turning a service business into something that runs
              on process rather than on me remembering things. That decade is the asset, and it
              comes with the cheque.
            </p>
            <div className="mb-8 flex flex-col gap-8">
              {BRINGS.map((item) => (
                <div key={item.title} className="border-l-2 border-[var(--primary-mint)] pl-5">
                  <p className="mb-2 font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <p className="max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              If you want to see how I think before you apply, the{' '}
              <Link href="/playbook" className="text-[var(--primary-mint)] hover:underline">
                playbook
              </Link>{' '}
              is free and it is the same material.
            </p>
          </section>

          {/* Disqualifier */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">
              Who should not apply
            </h2>
            <p className="mb-6 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              Being told no quickly is worth more than being strung along politely.
            </p>
            <ul className="flex flex-col gap-3">
              {NOT_FOR.map((item) => (
                <li key={item} className="flex gap-3">
                  <X size={18} className="mt-1 shrink-0 text-[var(--secondary-orange)]" aria-hidden="true" />
                  <span className="leading-relaxed text-[var(--text-muted)]">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Questions. Rendered from the same array the FAQ schema is built
              from: Google requires the marked-up Q&A to be visible on the page,
              and assistants quote whichever they find. One source, no drift. */}
          <section className="mb-12 border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Questions</h2>
            <dl className="flex flex-col gap-6">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="mb-2 font-semibold text-[var(--text-primary)]">{item.q}</dt>
                  <dd className="max-w-[60ch] leading-relaxed text-[var(--text-muted)]">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Apply */}
          <section id="apply" className="border-t border-[var(--rule-faint)] pt-8">
            <h2 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">Apply</h2>
            <p className="mb-8 max-w-[60ch] leading-relaxed text-[var(--text-muted)]">
              Nine questions, most of them one line. I read these myself. If it is a fit you will
              hear from me within a week, and if it is not I will tell you rather than leave you
              wondering.
            </p>
            <InvestForm />
          </section>
        </main>

        <div className="mt-16 lg:mt-0 lg:flex-1">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
