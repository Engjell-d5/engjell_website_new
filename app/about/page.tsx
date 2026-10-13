import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { KNOWS_ABOUT } from '@/lib/site';
import { VENTURES } from '@/lib/ventures';
import { VALUES } from '@/lib/values';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

const profilePageData = {
  name: 'About Engjell Rraklli',
  url: `${siteUrl}/about`,
  mainEntity: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
    jobTitle: 'Homegrown Albanian Tech Entrepreneur',
    description: 'Homegrown Albanian tech entrepreneur and founder of division5 and divisionAI, building service businesses that scale from Tirana.',
    url: siteUrl,
    image: `${siteUrl}/IMG_0466.JPG`,
    nationality: { '@type': 'Country', name: 'Albania' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tirana',
      addressCountry: 'AL',
    },
    sameAs: [
      'https://www.linkedin.com/in/engjell-rraklli-a8b20a68/',
      'https://x.com/RraklliEngjell',
      'https://www.youtube.com/@engjellrraklli',
    ],
    knowsAbout: [...KNOWS_ABOUT],
    worksFor: VENTURES.map((v) => ({
      '@type': 'Organization',
      name: v.name,
      url: v.url,
    })),
  },
};

export const metadata: Metadata = createMetadata({
  title: 'About Engjell Rraklli, Homegrown Albanian Tech Entrepreneur',
  description:
    'Engjell Rraklli founded division5 in Albania in 2015, at 23, with no money and no network. How a decade of building taught him which constraints were real.',
  path: '/about',
});

// The story in chapters. Every fact here is from the pillar essay or the
// speaking page, in his words where possible.
const CHAPTERS = [
  {
    when: 'May 2015',
    title: 'No money, no network, no plan B',
    body: 'I founded division5 at 23, with no connections, no money, no references and no experience. My plan lasted until the money ran out, which did not take long. The only way to keep the company alive was to sell software development services, so that is what we sold.',
  },
  {
    when: 'The next five years',
    title: 'Trying to escape',
    body: 'Once we were solvent I kept trying to pivot into a product. Every attempt pulled attention away from the business that was paying salaries, and none of the products got far enough to matter. I call it cheating on your business, because looking back, that is what it was.',
  },
  {
    when: 'Six years in',
    title: 'The bottleneck had my name on it',
    body: 'Clients were attached to me rather than to the company. Every proposal and every difficult call queued behind me, and I read that as being essential. It was the opposite. Founder dependency is not a property of services. It is a stage, and you build your way out of it with systems.',
  },
  {
    when: '2022',
    title: 'Writing it all down',
    body: 'We captured how the work actually gets done and built it into how new people learn, so someone leaving became a setback instead of a hole. I started divisionAI to put software underneath that operation, with AI inside it rather than bolted on the side.',
  },
  {
    when: 'Today',
    title: 'What it became',
    body: 'division5 is a marketplace that connects vetted AI-native engineers across the Balkans with companies in Europe and beyond. Our recruitment used to take five people and now runs with two, because agents do the assembly work and a person still makes every call that leaves the building.',
  },
];

export default function About() {
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />
      <StructuredData type="ProfilePage" data={profilePageData} />

      <PageHero
        label="About"
        title={
          <>
            I wanted to build games. <span className="text-[var(--primary-mint)]">The market had other plans.</span>
          </>
        }
        lede={
          <p>
            I live in Tirana. I founded division5 in 2015 and divisionAI in 2022, and for most of that
            time I was the reason my own company could not grow. This is how that happened, and what I
            did about it.
          </p>
        }
        image={{ src: '/photos/kosict-call.jpg', alt: 'Engjell Rraklli on a phone call outside the KosICT conference in Prishtina' }}
      />

      <section className="sec-light" aria-label="My story">
        <div className="wrap pad-y">
          <ol className="border-b border-[var(--line)]">
            {CHAPTERS.map((c) => (
              <li key={c.title} className="flex flex-wrap gap-x-12 gap-y-2 border-t border-[var(--line)] py-9">
                <p className="label mt-2 flex-[0_0_210px] !text-[var(--accent-text)]">{c.when}</p>
                <div className="min-w-0 max-w-[720px] flex-[1_1_520px]">
                  <h2 className="text-[clamp(32px,2.8vw,42px)] leading-[1.02] tracking-[0.03em]">{c.title}</h2>
                  <p className="mt-3.5 text-[17px] leading-[1.75] text-[var(--text)]">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* A photograph at full width, between the reading and the rest. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--deep)] md:aspect-[21/8]">
        <Image
          src="/photos/stage-adc-room.jpg"
          alt="Engjell Rraklli speaking to a full room at ADC 2023"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <section className="sec-deep" aria-labelledby="albania">
        <div className="wrap pad-y">
          <SectionLabel>Why I build in Albania</SectionLabel>
          <div className="mt-4 flex flex-wrap gap-x-20 gap-y-10">
            <div className="min-w-0 flex-[1_1_560px]">
              <h2 id="albania" className="text-balance text-[clamp(44px,4.6vw,70px)] leading-[0.96]">
                Albania exports its best people. Everything I build is a bet that it{' '}
                <span className="text-[var(--primary-mint)]">does not have to.</span>
              </h2>
              <p className="mt-6 max-w-[36em] text-base leading-relaxed text-[var(--text)]">
                A young engineer here should not have to choose between the career they want and the
                country they are from. Build companies here that meet a world standard, and they no
                longer have to. That means real projects, senior people to learn from, and the structure
                to grow into senior work without boarding a plane.
              </p>
            </div>
            <ul className="min-w-0 flex-[1_1_380px] self-end border-b border-[var(--line)]">
              {VENTURES.map((v) => (
                <li key={v.name}>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="group block border-t border-[var(--line)] py-6">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-xl font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--primary-mint)]">
                        {v.name}
                      </span>
                      <span className="meta">
                        {v.role} since {v.since} ↗
                      </span>
                    </span>
                    <span className="mt-2 block text-[15px] leading-relaxed text-[var(--text)]">{v.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="sec-dark" aria-labelledby="values">
        <div className="wrap pad-y">
          <SectionLabel>What I hold to</SectionLabel>
          <h2 id="values" className="h-section mt-3.5">
            Four things I learned the slow way
          </h2>
          <div className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.name} className="border-t border-[var(--line)] py-7">
                <h3 className="text-[34px] leading-none tracking-[0.03em]">{v.name}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--text)]">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-mint">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-8 py-[clamp(56px,6vw,88px)]">
          <div className="min-w-0 flex-[1_1_520px]">
            <h2 className="text-balance text-[clamp(40px,4vw,62px)] leading-[0.96]">
              If this sounds like your company, start with the playbook.
            </h2>
            <p className="mt-4 max-w-[40em] text-base leading-relaxed text-[var(--rich-black)]">
              It is the same diagnostics I run with leadership teams, written so you can do them on
              your own.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/playbook" className="btn btn-dark">
              Get the free playbook
            </Link>
            <Link href="/work" className="btn border-[var(--rich-black)] text-[var(--rich-black)] hover:bg-[var(--rich-black)] hover:text-[var(--primary-mint)]">
              Work with me
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
