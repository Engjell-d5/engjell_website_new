import Link from 'next/link';
import { MapPin, X } from 'lucide-react';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { yearsOfBuilding, KNOWS_ABOUT } from '@/lib/site';
import { TALKS, SPEAKING_CREDITS, FORMATS, BIOS, HOSTED_EPISODES, DECLINES } from '@/lib/speaking';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

// knowsAbout comes from lib/site so this page, /about and the sitewide schema
// in layout can never disagree about what he is an expert in.
const speakingPageData = {
  name: 'Speaking and podcast appearances',
  url: `${siteUrl}/speaking`,
  mainEntity: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
    jobTitle: 'Homegrown Albanian Tech Entrepreneur',
    url: siteUrl,
    description: BIOS.medium,
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
  },
};

export const metadata: Metadata = createMetadata({
  title: 'Speaking and Podcast Appearances',
  description:
    'Talks on scaling service businesses with AI agents, bootstrapped growth, and building software companies outside Silicon Valley. Booking, topics and bios.',
  path: '/speaking',
});

export default function Speaking() {
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Speaking', url: '/speaking' }]} />
      <StructuredData type="ProfilePage" data={speakingPageData} />

      {/* Positioning first: what is different, rather than a CV. */}
      <PageHero
        label="Speaking"
        title={
          <>
            I talk about what <span className="text-[var(--primary-mint)]">actually happened.</span>
          </>
        }
        lede={
          <>
            <p>
              Most AI talks are predictions. Mine are post-mortems. I have spent {yearsOfBuilding()} years
              building a tech company in Albania, and the last two putting agents into its operations, so I
              can tell an audience what the change cost rather than what it promises.
            </p>
            <p className="mt-4">
              A recruitment function that took five people now runs with two. The system behind it exposes
              more than 350 tools to its agents, and every one of them that writes anything still waits for
              a human. That is the talk. The numbers are real and I am happy to be asked about the parts that
              went badly.
            </p>
          </>
        }
        actions={
          <>
            <a href="#book" className="btn btn-primary">
              Book me
            </a>
            <a href="#bios" className="btn btn-secondary">
              Bios for producers
            </a>
          </>
        }
        image={{ src: '/photos/stage-kosict-slide.jpg', alt: 'Engjell Rraklli on stage beside his speaker slide', landscape: true }}
      />

      <section className="sec-light" aria-labelledby="talks">
        <div className="wrap pad-y">
          <SectionLabel>Talks</SectionLabel>
          <h2 id="talks" className="h-section mt-3.5">
            Four talks, each built on one argument
          </h2>
          <div className="mt-10 grid gap-x-12 lg:grid-cols-2">
            {TALKS.map((talk) => (
              <article key={talk.title} className="border-t border-[var(--line)] py-9">
                <h3 className="text-[clamp(32px,2.8vw,40px)] leading-[1.02] tracking-[0.03em]">{talk.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--text)]">{talk.abstract}</p>
                <p className="label mt-5 !text-[var(--accent-text)]">For {talk.audience}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {talk.takeaways.map((t) => (
                    <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-[var(--ink)]">
                      <span className="mt-[0.6em] block h-1.5 w-1.5 shrink-0 bg-[var(--primary-mint)]" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-dark" aria-labelledby="formats">
        <div className="wrap pad-y">
          <SectionLabel>Formats</SectionLabel>
          <h2 id="formats" className="h-section mt-3.5">
            Stage, panel, room or microphone
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FORMATS.map((f) => (
              <div key={f.name} className="card">
                <h3 className="text-[32px] leading-none tracking-[0.03em]">{f.name}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--text)]">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where a booker asks whether the person can hold an audience. One
          stage credit does not answer that; recorded conversations do, and
          unlike a credit they can be checked before deciding. */}
      <section className="sec-deep" aria-labelledby="proof">
        <div className="wrap pad-y flex flex-wrap items-end gap-x-20 gap-y-10">
          <div className="min-w-0 flex-[1_1_440px]">
            <SectionLabel>Proof you can check</SectionLabel>
            <p className="mt-4 font-bebas text-[clamp(110px,13vw,200px)] leading-[0.82] text-[var(--primary-mint)]">
              {HOSTED_EPISODES}
            </p>
            <h2 id="proof" className="mt-3 text-[clamp(36px,3.4vw,50px)] leading-[0.98]">
              Recorded long-form conversations
            </h2>
            <p className="mt-4 max-w-[36em] text-[17px] leading-relaxed text-[var(--text)]">
              Hosting{' '}
              <Link href="/podcast" className="text-link">
                Scaling the Unscalable
              </Link>
              . If you want to know how I handle an unscripted hour before booking me, that is the honest
              way to find out.
            </p>
          </div>
          <div className="min-w-0 flex-[1_1_380px]">
            <p className="label">Stages</p>
            <ul className="mt-3 border-b border-[var(--line)]">
              {SPEAKING_CREDITS.map((c) => (
                <li key={`${c.event}-${c.year}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[var(--line)] py-4">
                  <span>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-[var(--ink)] hover:text-[var(--primary-mint)]">
                        {c.event}
                      </a>
                    ) : (
                      <span className="text-lg font-bold text-[var(--ink)]">{c.event}</span>
                    )}
                    <span className="meta ml-3 inline-flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {c.location}
                    </span>
                  </span>
                  <span className="meta">
                    {c.format}, {c.year}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Producers copy-paste bios into show notes, so all three lengths are
          here, ready to lift without an email exchange. */}
      <section id="bios" className="sec-light" aria-labelledby="bios-title">
        <div className="wrap pad-y">
          <SectionLabel>For podcast producers</SectionLabel>
          <h2 id="bios-title" className="h-section mt-3.5">
            Bios, ready to paste
          </h2>
          <p className="mt-5 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            I host a show myself, so I know what makes an episode easy to edit. I show up prepared, I do
            not recite a pitch, and I am glad to return the favour and host you. Everything below is yours
            to copy without asking.
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {(
              [
                ['Short bio, 25 words', BIOS.short],
                ['Medium bio, 45 words', BIOS.medium],
                ['Full bio, 130 words', BIOS.long],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="card">
                <p className="label">{label}</p>
                <p className="text-[15px] leading-relaxed text-[var(--ink)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refusing work is the most credible thing an offer page does, and it
          saves both sides a call. */}
      <section className="sec-dark" aria-labelledby="declines">
        <div className="wrap pad-y">
          <SectionLabel>What I turn down</SectionLabel>
          <h2 id="declines" className="h-section mt-3.5">
            Saying no saves us both a call
          </h2>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {DECLINES.map((d) => (
              <li key={d} className="flex gap-4 border-t border-[var(--line)] py-6">
                <X size={22} className="mt-0.5 shrink-0 text-[var(--secondary-orange)]" aria-hidden="true" />
                <span className="text-base leading-relaxed text-[var(--ink)]">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="book" className="sec-mint" aria-labelledby="book-title">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-6 py-[clamp(56px,6vw,96px)]">
          <div className="min-w-0 flex-[1_1_520px]">
            <h2 id="book-title" className="text-[clamp(48px,5vw,80px)] leading-[0.92]">
              Book me
            </h2>
            <p className="mt-4 max-w-[40em] text-[17px] font-medium leading-relaxed text-[var(--rich-black)]">
              Tell me the audience, the date and the format, and I will tell you straight away whether I am
              the right person for it. If I am not, I will usually know who is.
            </p>
          </div>
          <Link href="/contact" className="btn btn-dark">
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}
