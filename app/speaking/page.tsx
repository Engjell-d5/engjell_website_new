import Link from 'next/link';
import { Mic, Users, Presentation, Radio, ArrowRight, MapPin } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { yearsOfBuilding, KNOWS_ABOUT } from '@/lib/site';
import { TALKS, SPEAKING_CREDITS, FORMATS, BIOS, HOSTED_EPISODES, DECLINES } from '@/lib/speaking';
import type { Metadata } from 'next';

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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Speaking', url: '/speaking' }]} />
      <StructuredData type="ProfilePage" data={speakingPageData} />

      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        <div className="h-14 border-b border-[var(--rule-faint)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-[var(--text-meta)]">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">
              Speaking
            </span>
          </div>
          <div className="font-montserrat text-[11px] text-[var(--text-meta)] font-bold tracking-[0.15em] hidden md:block">
            RECEIPTS, NOT PREDICTIONS.
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="max-w-4xl mx-auto">

            {/* Positioning. Leads with what is different rather than with a CV. */}
            <section className="animate-slide-up mb-16">
              <span className="page-label mb-3 block">Speaking</span>
              <h1 className="text-4xl md:text-6xl font-bebas text-white leading-[0.9] mb-6">
                I TALK ABOUT WHAT
                <br />
                ACTUALLY HAPPENED.
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-4">
                Most AI talks in 2026 are predictions. Mine are post-mortems. I have spent{' '}
                {yearsOfBuilding()} years building a tech company in Albania, and the last two
                putting agents into its operations, so I can tell an audience what the change cost
                rather than what it promises.
              </p>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                A recruitment function that took five people now runs with two. The system behind it
                exposes more than 350 tools to its agents, and every one of them that writes anything
                still waits for a human. That is the talk. The numbers are real and I am happy to be
                asked about the parts that went badly.
              </p>
            </section>

            {/* Talks */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Presentation className="w-5 h-5 text-[var(--primary-mint)]" />
                <h2 className="text-2xl font-bebas text-white tracking-wide">TALKS</h2>
              </div>

              <div className="space-y-8">
                {TALKS.map((talk) => (
                  <article
                    key={talk.title}
                    className="border-l-2 border-[var(--rule-faint)] pl-6 hover:border-[var(--primary-mint)] transition-colors"
                  >
                    <h3 className="text-xl text-white font-bold mb-3 leading-snug">{talk.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed mb-4">{talk.abstract}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] font-montserrat text-[var(--text-meta)] mb-3">
                      For: {talk.audience}
                    </p>
                    <ul className="space-y-1.5">
                      {talk.takeaways.map((t) => (
                        <li key={t} className="text-sm text-[var(--text-secondary)] flex gap-2.5">
                          <span className="text-[var(--primary-mint)] shrink-0">—</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            {/* Formats */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Mic className="w-5 h-5 text-[var(--primary-mint)]" />
                <h2 className="text-2xl font-bebas text-white tracking-wide">FORMATS</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FORMATS.map((f) => (
                  <div key={f.name} className="bg-[var(--rich-black)] border border-[var(--rule-faint)] p-5">
                    <h3 className="text-white font-bold mb-2">{f.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Podcast guest one-sheet. Producers want to copy-paste, so this
                gives them everything without an email exchange. */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Radio className="w-5 h-5 text-[var(--primary-mint)]" />
                <h2 className="text-2xl font-bebas text-white tracking-wide">FOR PODCAST PRODUCERS</h2>
              </div>

              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                I host{' '}
                <Link href="/podcast" className="text-[var(--primary-mint)] hover:underline">
                  Scaling the Unscalable
                </Link>
                , so I know what makes an episode easy to edit. I show up prepared, I do not recite a
                pitch, and I am glad to return the favour and host you. Everything below is yours to
                copy without asking.
              </p>

              <div className="space-y-5">
                {(
                  [
                    ['Short bio, 25 words', BIOS.short],
                    ['Medium bio, 45 words', BIOS.medium],
                    ['Full bio, 130 words', BIOS.long],
                  ] as const
                ).map(([label, text]) => (
                  <div key={label} className="bg-[var(--rich-black)] border border-[var(--rule-faint)] p-5">
                    <p className="text-[11px] uppercase tracking-[0.16em] font-montserrat text-[var(--text-meta)] mb-2.5">
                      {label}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Credits. One entry, presented plainly. Dressing up a single
                credit is more damaging than listing it honestly. */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Users className="w-5 h-5 text-[var(--primary-mint)]" />
                <h2 className="text-2xl font-bebas text-white tracking-wide">STAGES</h2>
              </div>

              {/* Placed here, not in the podcast section, because this is where a
                  booker asks whether the person can hold an audience. A stage list of
                  one does not answer that. Recorded conversations do, and unlike a
                  credit they can be checked before deciding. */}
              <div className="mb-8 border-l-2 border-[var(--primary-mint)] pl-6">
                <p className="text-white font-bold mb-1">
                  {HOSTED_EPISODES} recorded long-form interviews
                </p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Hosting{' '}
                  <Link href="/podcast" className="text-[var(--primary-mint)] hover:underline">
                    Scaling the Unscalable
                  </Link>
                  . If you want to know how I handle an unscripted hour before booking me,
                  that is the honest way to find out.
                </p>
              </div>
              <div className="space-y-3">
                {SPEAKING_CREDITS.map((c) => (
                  <div
                    key={`${c.event}-${c.year}`}
                    className="flex items-baseline justify-between gap-4 border-b border-[var(--rule-faint)] pb-3"
                  >
                    <div>
                      <span className="text-white font-bold">
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--primary-mint)] transition-colors"
                          >
                            {c.event}
                          </a>
                        ) : (
                          c.event
                        )}
                      </span>
                      <span className="text-[var(--text-meta)] text-sm ml-3 inline-flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {c.location}
                      </span>
                    </div>
                    <span className="text-[var(--text-meta)] text-sm font-montserrat shrink-0">
                      {c.format}, {c.year}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* What he turns down. Same lesson as the sprint page: refusing work is
                the most credible thing an offer page does, and it saves both sides a
                call. */}
            <section className="mb-16">
              <h2 className="text-2xl font-bebas text-white tracking-wide mb-6">WHAT I TURN DOWN</h2>
              <ul className="space-y-2.5">
                {DECLINES.map((d) => (
                  <li key={d} className="text-sm text-[var(--text-muted)] leading-relaxed pl-5 relative">
                    <span className="absolute left-0 text-[var(--secondary-orange)]">&times;</span>
                    {d}
                  </li>
                ))}
              </ul>
            </section>

            {/* Booking */}
            <section className="bg-[var(--rich-black)] border border-[var(--primary-mint)] p-8">
              <h2 className="text-2xl font-bebas text-white tracking-wide mb-3">BOOK ME</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                Tell me the audience, the date and the format, and I will tell you straight away
                whether I am the right person for it. If I am not, I will usually know who is.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Get in touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

          </div>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
