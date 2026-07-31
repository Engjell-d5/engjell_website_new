import Image from 'next/image';
import { Play, ExternalLink, Quote } from 'lucide-react';
import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import VideoList from '@/components/VideoList';
import PodcastApplicationButton from '@/components/PodcastApplicationButton';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { getVideos } from '@/lib/data';

// Rendered per request, see app/journal/page.tsx for why ISR is not used.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Podcast & Talks: The Conversation',
  description: 'Watch Engjell Rraklli\'s podcast episodes, talks, and video conversations on building tech businesses, leadership, and entrepreneurship in Albania.',
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
  // Build runs without DATABASE_URL; treat as empty and rely on ISR.
  if (!process.env.DATABASE_URL) return [];
  try {
    return await getVideos(false);
  } catch (err) {
    console.error('[podcast] getVideos failed; falling back to empty list:', err);
    return [];
  }
}

export default async function Podcast() {
  // Fetch videos server-side
  const allVideos = await loadVideosSafe();

  // Get featured video (first video is featured, as returned by API sorted by featured first)
  const featuredVideo = allVideos.find(v => v.featured) || allVideos[0];
  // Everything except the hero. Compare by id only: when no video carries the
  // `featured` flag the hero falls back to allVideos[0], and a `!v.featured`
  // test would let that same video through and render it twice.
  const otherVideos = allVideos.filter(v => v.id !== featuredVideo?.id);

  // Build VideoObject schema for the visible videos (featured + up to 9 others)
  const schemaVideos = [featuredVideo, ...otherVideos.slice(0, 9)].filter(Boolean) as YouTubeVideo[];
  const videoObjectSchema = schemaVideos.map(v => ({
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
    interactionStatistic: v.viewCount ? {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: parseInt(v.viewCount, 10) || 0,
    } : undefined,
  }));

  const itemListData = schemaVideos.length > 0
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Podcast', url: '/podcast' }]} />
      {itemListData && <StructuredData type="ItemList" data={itemListData} />}
      {videoObjectSchema.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectSchema) }}
        />
      )}
      {/* Left Panel - Latest Video */}
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh] min-w-0">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-2 md:gap-3 text-xs text-[var(--text-meta)] min-w-0">
            <span className="text-[var(--primary-mint)] font-bold flex-shrink-0">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px] truncate">Podcast</span>
          </div>
          <div className="font-montserrat text-[11px] text-[var(--text-meta)] font-bold tracking-[0.15em] hidden lg:block whitespace-nowrap">
            SMALL STEPS EVERY DAY BEAT ONE BIG STEP A YEAR.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 lg:p-10 min-w-0">
          <section className="animate-slide-up min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8 border-b border-[var(--border-color)] pb-4">
              <div className="min-w-0">
                <span className="page-label mb-2 md:mb-3 block">The Podcast</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bebas break-words">THE CONVERSATION</h1>
              </div>
              <a 
                href="https://www.youtube.com/@engjellrraklli" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary-on-image w-full md:w-auto flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                Visit Channel
              </a>
            </div>

            {allVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--text-meta)]">No videos available. Check back soon!</p>
              </div>
            ) : featuredVideo ? (
              <a
                href={`https://www.youtube.com/watch?v=${featuredVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full aspect-video border border-[var(--border-color)] group cursor-pointer overflow-hidden block"
              >
                <Image 
                  src={featuredVideo.thumbnailUrl} 
                  alt={`${featuredVideo.title} - YouTube video thumbnail`} 
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  priority
                  className="object-cover img-classic opacity-60 group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--primary-mint)] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 bg-gradient-to-t from-black to-transparent">
                  <span className="bg-[var(--primary-mint)] text-black text-[11px] font-bold px-2 py-1 uppercase tracking-[0.16em] mb-2 md:mb-3 inline-block">Latest Video</span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bebas tracking-wide break-words line-clamp-2 md:line-clamp-none">{featuredVideo.title}</h2>
                </div>
              </a>
            ) : null}

            {/* More Videos Section */}
            {otherVideos.length > 0 && <VideoList videos={otherVideos} />}
          </section>
        </div>
      </main>

       {/* Right Panel - Next 3 Videos */}
       <aside className="classic-panel md:col-span-3 flex flex-col p-4 md:p-6 gap-4 md:gap-6 bg-[var(--rich-black)] sticky-sidebar md:min-h-[80vh]">
         <div className="flex flex-col gap-4 md:gap-6 sticky-sidebar-content min-w-0">
        {/* Description */}
        <div className="relative p-4 md:p-6 border-l-4 border-[var(--primary-mint)] bg-[var(--rich-black)] min-w-0 overflow-hidden">
          <div className="absolute top-2 left-4 opacity-20">
            <Quote className="w-8 h-8 md:w-12 md:h-12 text-[var(--primary-mint)]" />
          </div>
          <div className="relative z-10 min-w-0">
            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed font-light italic pl-8 md:pl-10 pt-3 md:pt-4 break-words overflow-wrap-anywhere">
              "I talk about how to run a business which is more human, which provides real value, and which scales without losing its soul. I am a big believer that businesses should love problems first and make a profit next."
            </p>
          </div>
        </div>

        {/* Apply to Podcast Button */}
        <PodcastApplicationButton />
        </div>
      </aside>
    </div>
  );
}
