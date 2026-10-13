import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PodcastApplicationButton from '@/components/PodcastApplicationButton';
import MintBanner from '@/components/site/MintBanner';
import SectionLabel from '@/components/site/SectionLabel';
import { FeaturedEpisode, EpisodeRow, EpisodeCard } from '@/components/site/Episodes';
import { createMetadata } from '@/lib/metadata';
import { getVideos } from '@/lib/data';

// Rendered per request, see app/journal/page.tsx for why ISR is not used.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Scaling the Unscalable: the Podcast',
  description:
    "Engjell Rraklli's podcast: long conversations with founders about burnout, co-founders, bootstrapping and the parts of building a company that never make the pitch deck.",
  path: '/podcast',
});

interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  channelTitle: string;
  featured?: boolean;
  removed?: boolean;
}

async function loadVideosSafe() {
  // Build runs without DATABASE_URL; treat as empty.
  if (!process.env.DATABASE_URL) return [];
  try {
    return await getVideos();
  } catch (err) {
    console.error('[podcast] getVideos failed; falling back to empty list:', err);
    return [];
  }
}

export default async function Podcast() {
  const allVideos = await loadVideosSafe();

  // Featured first, then the newest three beside it, then the archive.
  const featuredVideo = allVideos.find((v) => v.featured) || allVideos[0];
  // Compare by id only: when no video carries the `featured` flag the hero
  // falls back to allVideos[0], and a `!v.featured` test would let that same
  // video through and render it twice.
  const otherVideos = allVideos.filter((v) => v.id !== featuredVideo?.id);
  const beside = otherVideos.slice(0, 3);
  const archive = otherVideos.slice(3);

  // VideoObject schema for the visible videos (featured + up to 9 others)
  const schemaVideos = [featuredVideo, ...otherVideos.slice(0, 9)].filter(Boolean) as YouTubeVideo[];
  const videoObjectSchema = schemaVideos.map((v) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: v.description?.slice(0, 500) || v.title,
    thumbnailUrl: v.thumbnailUrl,
    uploadDate: v.publishedAt,
    duration: v.duration,
    embedUrl: `https://www.youtube.com/embed/${v.videoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    publisher: {
      '@type': 'Person',
      name: 'Engjell Rraklli',
    },
    interactionStatistic: v.viewCount
      ? {
          '@type': 'InteractionCounter',
          interactionType: { '@type': 'WatchAction' },
          userInteractionCount: parseInt(v.viewCount, 10) || 0,
        }
      : undefined,
  }));

  const itemListData =
    schemaVideos.length > 0
      ? {
          name: 'Engjell Rraklli: Video conversations and podcasts',
          itemListElement: schemaVideos.map((v, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://www.youtube.com/watch?v=${v.videoId}`,
            name: v.title,
          })),
        }
      : null;

  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Podcast', url: '/podcast' }]} />
      {itemListData && <StructuredData type="ItemList" data={itemListData} />}
      {videoObjectSchema.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }} />
      )}

      <MintBanner text="Scaling the Unscalable" as="h1" id="podcast-title">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
          <p className="m-0 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">
            Long conversations with founders about the parts of building a company that never make the
            pitch deck: burnout, co-founders, bootstrapping, and the loneliness nobody mentions.
            {allVideos.length > 0 && ` ${allVideos.length} episodes so far.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://www.youtube.com/@engjellrraklli" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Watch on YouTube
            </a>
            <a href="#guest" className="btn btn-secondary">
              Be a guest
            </a>
          </div>
        </div>
      </MintBanner>

      {allVideos.length === 0 ? (
        <section className="sec-deep">
          <div className="wrap pad-y">
            <p className="text-[var(--text)]">Episodes are loading from YouTube. Check back shortly.</p>
          </div>
        </section>
      ) : (
        <section className="sec-deep" aria-label="Latest episodes">
          <div className="wrap flex flex-wrap gap-10 pb-[clamp(64px,7vw,104px)] pt-4">
            {featuredVideo && (
              <div className="min-w-0 flex-[1_1_560px]">
                <FeaturedEpisode ep={featuredVideo} priority />
              </div>
            )}
            {beside.length > 0 && (
              <div className="flex min-w-0 flex-[1_1_340px] flex-col">
                {beside.map((ep) => (
                  <EpisodeRow key={ep.id} ep={ep} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {archive.length > 0 && (
        <section className="sec-dark" aria-labelledby="archive">
          <div className="wrap pad-y">
            <SectionLabel as="h2" id="archive">
              Every episode
            </SectionLabel>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {archive.map((ep) => (
                <EpisodeCard key={ep.id} ep={ep} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec-light" aria-label="Why the show exists">
        <div className="wrap pad-y">
          <SectionLabel>Why I host it</SectionLabel>
          <p className="mt-5 max-w-[22em] text-balance font-bebas text-[clamp(44px,5vw,78px)] leading-[0.96] tracking-[0.015em] text-[var(--ink)]">
            A business can be more human, give real value, and still scale without losing its soul.
          </p>
          <p className="mt-6 max-w-[40em] text-[17px] leading-relaxed text-[var(--text)]">
            Love the problem first, and the profit comes next. Every guest has built something real, and
            every conversation goes where the interesting part is, including the parts that went badly.
          </p>
        </div>
      </section>

      <section id="guest" className="sec-dark" aria-labelledby="guest-title">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-8 py-[clamp(64px,7vw,104px)]">
          <div className="min-w-0 flex-[1_1_520px]">
            <SectionLabel>Be a guest</SectionLabel>
            <h2 id="guest-title" className="h-section mt-3.5">
              Built something worth talking about?
            </h2>
            <p className="mt-4 max-w-[40em] text-base leading-relaxed text-[var(--text)]">
              Tell me what you have built and what you are stuck on. I read every application and reply to
              the ones that would make a good hour.
            </p>
          </div>
          <div className="w-full max-w-[340px]">
            <PodcastApplicationButton />
          </div>
        </div>
      </section>
    </main>
  );
}
