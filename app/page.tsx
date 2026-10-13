import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { getBlogs, getVideos } from '@/lib/data';
import { START_HERE_SLUG } from '@/lib/site';
import { HOSTED_EPISODES } from '@/lib/speaking';
import { VENTURES } from '@/lib/ventures';
import { readingTimeMinutes } from '@/lib/reading-time';
import { formatDateShort } from '@/lib/format';
import SectionLabel from '@/components/site/SectionLabel';
import PhotoTiles, { type Tile } from '@/components/site/PhotoTiles';
import MintBanner from '@/components/site/MintBanner';
import JournalList from '@/components/site/JournalList';
import { FeaturedEpisode, EpisodeRow } from '@/components/site/Episodes';
import PlaybookCta from '@/components/PlaybookCta';

// Rendered per request, see app/journal/page.tsx for why ISR is not used.
export const dynamic = 'force-dynamic';

// No year count in the description on purpose, `metadata` is evaluated once
// at module load, so a hardcoded "11 years" would go stale between deploys.
export const metadata: Metadata = createMetadata({
  // Kept under 160 characters so search results show the whole sentence.
  description:
    'Tech entrepreneur in Tirana. I build service businesses that scale, write about what it takes, and back founders building in Albania and Kosovo.',
  path: '/',
});

// Every number here traces to lib/speaking.ts or the essay. An inflated one is
// checkable in a click and costs more than it earns.
const RECEIPTS = [
  { n: '2015', note: 'Founded division5 at 23. No money, no network, no references.' },
  { n: '5 → 2', note: 'People it takes to run our recruitment, now that agents do the assembly work.' },
  { n: '350+', note: 'Tools our agents can use. Every one that writes still waits for a human.' },
  { n: String(HOSTED_EPISODES), note: 'Long-form conversations recorded with founders for the podcast.' },
];


const OFFERS = [
  {
    href: '/sprint',
    for: 'For service business founders',
    title: 'The Constraint Sprint',
    body: 'Four remote sessions over two weeks with you and your leadership team. You leave with a written analysis of what the business is stuck on and a ninety day plan to clear it.',
    fact: '€7,500 fixed. If the first session is not useful, we stop and you pay nothing.',
    go: 'How the sprint works',
  },
  {
    href: '/speaking',
    for: 'For organisers and podcast hosts',
    title: 'Speaking',
    body: 'Talks about what actually happened when we put AI agents into a real business, including the parts that went badly. Post-mortems, not predictions.',
    fact: 'Conference talks, panels, half-day workshops and podcast guest spots.',
    go: 'Topics and bios',
  },
  {
    href: '/invest',
    for: 'For founders in Albania and Kosovo',
    title: 'Angel investing',
    body: 'I back B2B productized services and services turned into software, built here and already selling in Europe or the US. Customers and distribution come with the cheque.',
    fact: 'No fund and no committee. I read every application myself.',
    go: 'What I invest in',
  },
];

async function loadContent() {
  if (!process.env.DATABASE_URL) return { blogs: [], videos: [] };
  const [blogs, videos] = await Promise.all([getBlogs().catch(() => []), getVideos().catch(() => [])]);
  return { blogs, videos };
}

export default async function Home() {
  const { blogs, videos } = await loadContent();

  const published = blogs
    .filter((b) => b.published)
    .sort((a, z) => (z.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  // The pinned reference piece gets the "Start here" slot; the list shows
  // what came after it, so the two never repeat each other.
  const startHere = START_HERE_SLUG ? published.find((b) => b.slug === START_HERE_SLUG) : undefined;
  const latest = published.filter((b) => b.slug !== START_HERE_SLUG).slice(0, 4);

  const featured = videos.find((v) => v.featured) || videos[0];

  // Three tiles, three different places: a working table at the Skills Expo,
  // the podcast studio, and the ADC stage. The studio appears once here and
  // once in the hero, never twice in the same row.
  const tiles: Tile[] = [
    {
      href: '/ventures',
      image: '/photos/kosict-conversation.jpg',
      label: 'division5 · divisionAI',
      keepCase: true,
      title: 'Builds',
      body: 'Service businesses that scale, and the teams and systems that run them.',
    },
    {
      href: '/podcast',
      image: '/photos/studio-ringlight.jpg',
      label: 'Scaling the Unscalable',
      title: 'Talks',
      body: 'Long conversations with founders about what really happens inside a company.',
    },
    {
      href: '/speaking',
      image: '/photos/stage-adc-crowd.jpg',
      label: 'Speaking',
      title: 'Speaks',
      body: 'Post-mortems, not predictions. What putting AI agents into a real business cost.',
    },
  ];
  const moreEpisodes = videos.filter((v) => v.id !== featured?.id).slice(0, 3);

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="sec-dark">
        <div className="wrap pb-[clamp(56px,6vw,96px)] pt-[clamp(40px,6vw,96px)]">
          <div className="flex flex-wrap-reverse items-center gap-[clamp(36px,5.5vw,88px)]">
            <div className="min-w-0 flex-[1_1_560px] animate-slide-up">
              <span className="chip">Tirana, Albania</span>
              <h1 className="mt-6 text-balance text-[clamp(46px,5.3vw,80px)] leading-[0.94] tracking-[0.012em]">
                Most service businesses are only as big as their founder.{' '}
                <span className="text-[var(--primary-mint)]">Mine was too.</span>
              </h1>
              <p className="lede mt-7 max-w-[33em]">
                I founded division5 in Albania in 2015, at 23, with no money and no network. The next
                decade taught me which constraints were real and which ones I had invented. This site is
                that decade, written down.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/playbook" className="btn btn-primary">
                  Get the free playbook
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href={startHere ? `/journal/${startHere.slug}` : '/journal'} className="btn btn-secondary">
                  Read the essay
                </Link>
              </div>
            </div>
            <figure className="m-0 w-full max-w-[430px] flex-[1_1_300px]">
              <div className="brackets">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--deep)]">
                  <Image
                    src="/IMG_0466.JPG"
                    alt="Engjell Rraklli in the Scaling the Unscalable studio in Tirana"
                    fill
                    quality={85}
                    priority
                    sizes="(min-width: 1024px) 430px, 100vw"
                    className="object-cover"
                    style={{ objectPosition: '50% 28%' }}
                  />
                </div>
              </div>
              <figcaption className="meta mt-4">On set for Scaling the Unscalable, Tirana</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Receipts */}
      <section className="sec-deep" aria-labelledby="receipts">
        <div className="wrap py-11">
          <SectionLabel as="h2" id="receipts">
            Receipts, not predictions
          </SectionLabel>
          <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-8 lg:grid-cols-4">
            {RECEIPTS.map((r) => (
              <div key={r.note}>
                <p className="font-bebas text-[clamp(52px,4.8vw,72px)] leading-none tracking-[0.02em] text-white">
                  {r.n.includes('→') ? (
                    <>
                      {r.n.split('→')[0]}
                      <span className="align-[0.18em] font-montserrat text-[0.6em] font-semibold text-[var(--primary-mint)]">
                        →
                      </span>
                      {r.n.split('→')[1]}
                    </>
                  ) : (
                    r.n
                  )}
                </p>
                <p className="mt-2.5 max-w-[20em] text-sm leading-relaxed text-[var(--text)]">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PhotoTiles tiles={tiles} />

      {/* Reading happens on the light surface */}
      <section className="sec-light">
        <div className="wrap pad-y">
          {startHere && (
            <div className="flex flex-wrap items-end gap-x-[72px] gap-y-8">
              <div className="min-w-0 flex-[1_1_560px]">
                <SectionLabel className="!text-[var(--accent-text)]">Start here</SectionLabel>
                <p className="mt-4 text-balance font-bebas text-[clamp(44px,4.8vw,72px)] leading-[0.96] tracking-[0.015em] text-[var(--ink)]">
                  “Services don’t scale.” That rule was never about services. It was about founders.
                </p>
              </div>
              <div className="min-w-0 flex-[1_1_320px] pb-1.5">
                <p className="text-base leading-relaxed text-[var(--text)]">
                  The essay behind everything else on this site. A decade of running division5, which
                  constraints were real, which ones I invented, and what changed when AI removed the last
                  one that was true.
                </p>
                <p className="meta mt-4">
                  {startHere.publishedAt && formatDateShort(startHere.publishedAt)}
                  {startHere.content ? ` · ${readingTimeMinutes(startHere.content)} min read` : ''}
                </p>
                <Link href={`/journal/${startHere.slug}`} className="link-rule mt-3.5">
                  Read the essay
                </Link>
              </div>
            </div>
          )}

          <div id="writing" className={startHere ? 'mt-[clamp(72px,8vw,112px)]' : ''}>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div>
                <SectionLabel>Journal</SectionLabel>
                <h2 className="h-section mt-3.5">Notes from inside a service business</h2>
              </div>
              <Link href="/journal" className="link-rule">
                All {published.length || ''} essays
              </Link>
            </div>
            <div className="mt-9">
              {latest.length > 0 ? (
                <JournalList items={latest} showImages={false} />
              ) : (
                <p className="border-t border-[var(--line)] pt-6 text-[var(--text)]">New essays are on the way.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The podcast, opened by the one loud moment on the page */}
      <MintBanner text="Scaling the Unscalable" id="podcast-title">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <p className="m-0 max-w-[46em] text-base leading-relaxed text-[var(--text)]">
            The podcast. Long conversations with founders about the parts of building a company that
            never make the pitch deck: burnout, co-founders, bootstrapping, and the loneliness nobody
            mentions.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/podcast" className="link-rule">
              All episodes
            </Link>
            <Link href="/podcast#guest" className="link-rule">
              Be a guest
            </Link>
          </div>
        </div>
      </MintBanner>
      {featured && (
        <section className="sec-deep" aria-label="Latest episodes">
          <div className="wrap flex flex-wrap gap-10 pb-[clamp(64px,7vw,104px)] pt-2">
            <div className="min-w-0 flex-[1_1_560px]">
              <FeaturedEpisode ep={featured} />
            </div>
            {moreEpisodes.length > 0 && (
              <div className="flex min-w-0 flex-[1_1_340px] flex-col">
                {moreEpisodes.map((ep) => (
                  <EpisodeRow key={ep.id} ep={ep} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Work with me */}
      <section id="work" className="sec-dark" aria-labelledby="work-title">
        <div className="wrap pad-y">
          <SectionLabel>Work with me</SectionLabel>
          <h2 id="work-title" className="h-section mt-3.5">
            Three ways to work together
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {OFFERS.map((o) => (
              <Link key={o.href} href={o.href} className="card">
                <p className="label">{o.for}</p>
                <h3 className="text-[36px] leading-none tracking-[0.03em]">{o.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--text)]">{o.body}</p>
                <p className="border-t border-[var(--line-soft)] pt-4 text-sm font-semibold text-[var(--ink)]">{o.fact}</p>
                <span className="mt-auto text-sm font-bold text-[var(--accent-text)]">{o.go} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Albania */}
      <section id="albania" className="sec-deep" aria-labelledby="albania-title">
        <div className="wrap pad-y">
          <SectionLabel>Why I build in Albania</SectionLabel>
          <div className="mt-4 flex flex-wrap gap-x-20 gap-y-10">
            <div className="min-w-0 flex-[1_1_560px]">
              <h2 id="albania-title" className="text-balance text-[clamp(44px,4.6vw,70px)] leading-[0.96]">
                Albania exports its best people. Everything I build is a bet that it{' '}
                <span className="text-[var(--primary-mint)]">does not have to.</span>
              </h2>
              <p className="mt-6 max-w-[36em] text-base leading-relaxed text-[var(--text)]">
                A young engineer here should not have to choose between the career they want and the
                country they are from. Real projects, senior people to learn from, and clients across
                Europe, without boarding a plane. That is what the companies are for.
              </p>
              <Link href="/about" className="link-rule mt-6">
                Read my story
              </Link>
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

      <PlaybookCta variant="section" />
    </main>
  );
}
