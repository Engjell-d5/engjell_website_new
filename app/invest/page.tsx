import Image from 'next/image';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import InvestForm from '@/components/InvestForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
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
 * which is also how a model retrieves. There was a Questions section carrying
 * FAQPage schema, but five of its six answers restated the section directly
 * above them; the markup was driving the copy. It comes back when there are
 * terms to publish, because those are the questions it would not duplicate.
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
    'Angel investment in B2B productized digital services, high-ticket B2B products and services delivered as software, built in Albania or Kosovo and already selling to paying customers in Europe or the US. Invested by Engjell Rraklli directly or through his ventures, division5 and divisionAI, and coming with customer introductions, distribution, and help streamlining and automating delivery.',
};

export const metadata: Metadata = createMetadata({
  title: 'Angel Investing in Albania and Kosovo',
  description:
    'Engjell Rraklli invests in B2B productized digital services, high-ticket B2B products and services delivered as software, built in Albania or Kosovo and already selling in Europe or the US. Customers, distribution and automation come with the cheque.',
  path: '/invest',
});

const CATEGORIES = [
  {
    title: 'B2B productized digital services',
    body: 'A service sold like a product. Fixed scope, fixed price, delivered the same way every time. The test is simple: if your second client costs you materially less to serve than your first, you are productized. If every project starts from a blank page, you are not, and that is the first thing worth fixing.',
  },
  {
    title: 'Services as software',
    body: 'Work that used to be sold by the hour, now delivered mostly by software with AI doing the labour and people kept on the judgement. The customer buys the outcome rather than a team, and your cost of serving the next one is close to nothing. If you are partway along that road, that is a good place to find me.',
  },
  {
    title: 'High-ticket B2B products',
    body: 'Something sold to other businesses at a price that justifies a real sales conversation rather than a checkout button. High ticket matters because it forgives a small market. You do not need a million users in a country of three million people; you need a few hundred customers who are genuinely better off.',
  },
];

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
    body: 'Once delivery is consistent it can be automated, and that is what divisionAI does: software underneath the operation, with AI inside it rather than bolted on the side. In that order, because automating a process nobody has straightened out first just makes the mess run faster.',
  },
];

const LOOKING_FOR = [
  'Revenue that already exists, however small. It proves somebody is willing to pay, which is the only evidence that counts',
  'Delivery that repeats. The same thing sold twice beats a bespoke project sold once, every time',
  'A founder who can name what the business is stuck on without rehearsing it first',
  'Customers already abroad, in Europe or the US. Not a plan to sell there. Paying customers there now. The first foreign customer is a completely different problem to the tenth, and I want you past the first',
];

const NOT_FOR = [
  'Consumer apps. I would be guessing, and you deserve better than my guess',
  'Agencies billing purely by the hour with nothing productized. That is a job, not a business you can sell',
  'Companies selling only to Albanian or Kosovar customers. Good businesses, wrong investor. The ceiling is the local economy and I cannot lift it for you',
  'Ideas with no paying customers yet. Come back when someone abroad has paid, or when someone has said no for a reason you understand',
  'Anyone who wants a passive cheque. If money alone were enough, you would not need me specifically',
];

export default function InvestPage() {
  return (
    <main id="main-content">
      <StructuredData type="Service" data={investData} />
      <Breadcrumbs
        items={[
          { name: 'Home', url: siteUrl },
          { name: 'Invest', url: `${siteUrl}/invest` },
        ]}
      />

      <PageHero
        label="Angel investing · Albania and Kosovo"
        title={
          <>
            Engjëll means <span className="text-[var(--primary-mint)]">angel.</span>
          </>
        }
        lede={
          <>
            <p>
              I back B2B productized digital services, high-ticket B2B products, and services turned into
              software, built in <strong className="text-[var(--ink)]">Albania and Kosovo</strong>.
            </p>
            <p className="mt-4">
              I am not a fund and there is no committee. Investment comes from me directly or through my
              ventures,{' '}
              <Link href="/ventures" className="text-link">
                division5 and divisionAI
              </Link>
              , and which of those it is depends on what the business actually needs.
            </p>
          </>
        }
        actions={
          <a href="#apply" className="btn btn-primary">
            Apply
          </a>
        }
        image={{ src: '/photos/kosict-listening.jpg', alt: 'Engjell Rraklli listening during a conversation at KosICT in Prishtina', landscape: true }}
      />

      <section className="sec-light" aria-labelledby="what">
        <div className="wrap pad-y">
          <SectionLabel>What I invest in</SectionLabel>
          <h2 id="what" className="h-section mt-3.5">
            Three kinds of business
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c.title} className="card">
                <h3 className="text-[32px] leading-[1.02] tracking-[0.03em]">{c.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--text)]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-deep" aria-labelledby="where">
        <div className="wrap pad-y flex flex-wrap gap-x-20 gap-y-8">
          <div className="min-w-0 flex-[1_1_480px]">
            <SectionLabel>Where</SectionLabel>
            <h2 id="where" className="mt-3.5 text-balance text-[clamp(44px,4.6vw,70px)] leading-[0.96]">
              Built here, <span className="text-[var(--primary-mint)]">sold abroad</span>
            </h2>
            <div className="relative mt-10 aspect-[3/2] w-full overflow-hidden bg-[var(--deep)]">
              <Image
                src="/photos/adc-audience.jpg"
                alt="Developers in the audience at ADC 2023"
                fill
                quality={85}
                sizes="(min-width: 1024px) 580px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="min-w-0 flex-[1_1_480px] space-y-4 text-[17px] leading-relaxed text-[var(--text)]">
            <p>
              The company and the team operate in Albania or Kosovo. The customers do not. They are in{' '}
              <strong className="text-[var(--ink)]">Europe or the US</strong>, and they are already paying.
              Not a plan to expand there, not a pilot, revenue.
            </p>
            <p>
              This is the hardest filter on the page and the one I will not move on. A company selling only
              locally is capped by an economy of a few million people, and the work of landing the first
              customer in Berlin or Chicago is not something I can do on your behalf. Once you have proven
              you can, doing it repeatably is exactly what I am useful for.
            </p>
            <p>
              Albania exports its best people. Everything I have built here is a bet that it does not have
              to, and this is the same bet with a different instrument.
            </p>
          </div>
        </div>
      </section>

      <section className="sec-dark" aria-labelledby="look-for">
        <div className="wrap pad-y">
          <SectionLabel>What I look for</SectionLabel>
          <h2 id="look-for" className="h-section mt-3.5">
            Evidence, not a pitch
          </h2>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {LOOKING_FOR.map((item) => (
              <li key={item} className="flex gap-4 border-t border-[var(--line)] py-6">
                <Check size={22} className="mt-0.5 shrink-0 text-[var(--primary-mint)]" aria-hidden="true" />
                <span className="text-base leading-relaxed text-[var(--ink)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec-light" aria-labelledby="brings">
        <div className="wrap pad-y">
          <div className="flex flex-wrap items-end gap-x-16 gap-y-10">
            <div className="min-w-0 flex-[1_1_480px]">
              <SectionLabel>What I bring besides money</SectionLabel>
              <h2 id="brings" className="h-section mt-3.5">
                The decade comes with the cheque
              </h2>
              <p className="mt-5 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
                I founded{' '}
                <Link href="/ventures" className="text-link">
                  division5
                </Link>{' '}
                in 2015 and spent the decade since turning a service business into something that runs on
                process rather than on me remembering things. That decade is the asset.
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full min-w-0 max-w-[480px] flex-[1_1_320px] overflow-hidden bg-[var(--deep)]">
              <Image
                src="/photos/studio-profile.jpg"
                alt="Engjell Rraklli recording an episode of Scaling the Unscalable"
                fill
                quality={85}
                sizes="(min-width: 1024px) 480px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="mt-10 grid gap-x-12 md:grid-cols-2">
            {BRINGS.map((item, i) => (
              <div key={item.title} className="flex gap-6 border-t border-[var(--line)] py-7">
                <span className="font-bebas text-[44px] leading-none text-[var(--accent-text)]" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[30px] leading-[1.02] tracking-[0.03em]">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--text)]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            If you want to see how I think before you apply, the{' '}
            <Link href="/playbook" className="text-link">
              playbook
            </Link>{' '}
            is free and it is the same material.
          </p>
        </div>
      </section>

      <section className="sec-deep" aria-labelledby="not-for">
        <div className="wrap pad-y">
          <SectionLabel>Who should not apply</SectionLabel>
          <h2 id="not-for" className="h-section mt-3.5">
            A quick no beats a polite maybe
          </h2>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {NOT_FOR.map((item) => (
              <li key={item} className="flex gap-4 border-t border-[var(--line)] py-6">
                <X size={22} className="mt-0.5 shrink-0 text-[var(--secondary-orange)]" aria-hidden="true" />
                <span className="text-base leading-relaxed text-[var(--ink)]">{item}</span>
              </li>
            ))}
          </ul>
          {/* The filter above rules out most readers by design. Sending them
              away with nothing wastes the visit, and the sprint is the same
              work without the investment. */}
          <p className="mt-10 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            If one of those is you, the work itself is still worth doing.{' '}
            <Link href="/sprint" className="text-link">
              The Constraint Sprint
            </Link>{' '}
            is the same four sessions I would run with a company I had invested in, without the investment,
            and it is open to anyone anywhere.
          </p>
        </div>
      </section>

      <section id="apply" className="sec-dark" aria-labelledby="apply-title">
        <div className="wrap pad-y flex flex-wrap gap-x-20 gap-y-10">
          <div className="min-w-0 flex-[1_1_360px]">
            <SectionLabel>Apply</SectionLabel>
            <h2 id="apply-title" className="h-section mt-3.5">
              Nine questions, most of them one line
            </h2>
            <p className="mt-5 max-w-[34em] text-[17px] leading-relaxed text-[var(--text)]">
              I read these myself. If it is a fit you will hear from me within a week, and if it is not I
              will tell you rather than leave you wondering.
            </p>
          </div>
          <div className="min-w-0 flex-[1_1_560px]">
            <InvestForm />
          </div>
        </div>
      </section>
    </main>
  );
}
