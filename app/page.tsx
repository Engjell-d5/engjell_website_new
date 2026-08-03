import Image from 'next/image';
import Link from 'next/link';
import { Quote, MapPin, BookOpen, Play } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { createMetadata } from '@/lib/metadata';
import { getBlogs, getVideos } from '@/lib/data';
import { yearsOfBuilding, yearsOfHiring, START_HERE_SLUG } from '@/lib/site';
import { ArrowRight } from 'lucide-react';
import { VENTURE_COUNT } from '@/lib/ventures';
import type { Metadata } from 'next';

// Rendered per request, see app/journal/page.tsx for why ISR is not used.
export const dynamic = 'force-dynamic';

// No year count in the description on purpose, `metadata` is evaluated once
// at module load, so a hardcoded "11 years" would go stale between deploys.
export const metadata: Metadata = createMetadata({
  // Kept under 160 characters so search results show the whole sentence rather
  // than cutting it mid-clause. The old one ran to 187 and ended in a keyword
  // list ("software development, startups, and tech innovation in Albania")
  // that read as filler to a person and counts for nothing with Google.
  description: 'Tech entrepreneur in Tirana. I build software companies, write about scaling service businesses with AI, and back young Albanian talent.',
  path: '/',
});

// Fetch the freshest video and blog server-side so the homepage's newest
// internal links are in the initial HTML (crawlable) instead of a client fetch.
// Only the fields the sidebar renders are passed to the client component;
// never the full blog (its `content` would bloat the page payload).
async function loadLatestContent() {
  if (!process.env.DATABASE_URL) {
    return { video: null, blog: null, videoCount: null, blogCount: null, startHere: null };
  }
  try {
    const [videos, blogs] = await Promise.all([
      getVideos(false).catch(() => []),
      getBlogs().catch(() => []),
    ]);
    const v = videos.find((vid: any) => vid.featured) || videos[0] || null;
    const video = v
      ? {
          id: v.id,
          videoId: v.videoId,
          title: v.title,
          description: '',
          thumbnailUrl: v.thumbnailUrl,
          publishedAt: v.publishedAt,
          duration: v.duration,
          viewCount: v.viewCount,
          channelTitle: v.channelTitle,
          featured: v.featured,
        }
      : null;
    const b =
      blogs
        .filter((blog: any) => blog.published)
        .sort((a: any, z: any) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = z.publishedAt ? new Date(z.publishedAt).getTime() : 0;
          return dateB - dateA;
        })[0] || null;
    const blog = b
      ? {
          id: b.id,
          title: b.title,
          slug: b.slug,
          category: b.category,
          excerpt: '',
          imageUrl: b.imageUrl,
          published: b.published,
          publishedAt: b.publishedAt,
        }
      : null;
    const videoCount = videos.length || null;
    const blogCount = blogs.filter((blog: any) => blog.published).length || null;

    // The pinned reference piece, taken from the same query rather than a
    // second one. Without this the homepage only surfaced it by accident, via
    // the sidebar's "Latest Blog", so it would disappear the moment anything
    // newer was published.
    const p = START_HERE_SLUG
      ? blogs.find((blog: any) => blog.slug === START_HERE_SLUG && blog.published)
      : null;
    const startHere = p ? { title: p.title, slug: p.slug, excerpt: p.excerpt } : null;

    return { video, blog, videoCount, blogCount, startHere };
  } catch (err) {
    console.error('[home] loading latest content failed:', err);
    return { video: null, blog: null, videoCount: null, blogCount: null, startHere: null };
  }
}

export default async function Home() {
  const { video, blog, videoCount, blogCount, startHere } = await loadLatestContent();
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--rule-faint)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-[var(--text-meta)]">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Home</span>
          </div>
          <div className="font-montserrat text-[11px] text-[var(--text-meta)] font-bold tracking-[0.15em] hidden md:block">
            IF IT WAS EASY, EVERYONE WOULD DO IT.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            {/* Full Width Hero */}
            <div className="relative w-[calc(100%+3rem)] md:w-[calc(100%+5rem)] h-[70vh] min-h-[440px] max-h-[600px] md:h-[600px] md:max-h-none border-b border-[var(--rule-faint)] overflow-hidden group mb-8 -ml-6 -mr-6 -mt-6 md:-ml-10 md:-mr-10 md:-mt-10 rounded-none">
              <Image 
                src="/IMG_0425.JPG" 
                alt="Engjell Rraklli - Tech Entrepreneur building the future in Albania" 
                fill
                priority
                sizes="100vw"
                className="object-cover img-classic"
                style={{ objectPosition: 'center 20%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-transparent to-transparent opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--rich-black)]/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 md:p-16 z-10 w-full">
                <div className="flex items-center gap-2 mb-4">
                  {/* Was "Founder's Note", which described nothing on this
                      screen. The note lives in the bio block further down. */}
                  <span className="bg-[var(--primary-mint)] text-[var(--rich-black)] text-[11px] font-bold px-3 py-1 uppercase tracking-[0.16em] inline-block">Tirana, Albania</span>
                </div>
                <h1 className="text-6xl md:text-8xl text-white font-bebas leading-[0.85] tracking-tight max-w-4xl">
                  {/* The trailing spaces are load bearing. Without them JSX
                      emits the text nodes flush against each other, so a
                      crawler that strips the <br /> reads this heading as
                      "BUILDING THEFUTUREIN ALBANIA." They sit immediately
                      before a line break, so they change nothing visually. */}
                  BUILDING THE{' '}<br />
                  <span className="text-[var(--primary-mint)]">FUTURE</span>{' '}<br />
                  IN ALBANIA.
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href="/podcast" className="btn btn-primary">
                    <Play className="w-4 h-4 fill-current" />
                    Listen to the Podcast
                  </Link>
                  <Link href="/contact" className="btn btn-secondary-on-image">
                    Work With Me
                  </Link>
                </div>
              </div>
            </div>

            {/* Bio Grid (Split Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 mb-12 overflow-hidden">
              {/* Portrait Image Column */}
              <div className="md:col-span-4 h-64 md:h-auto relative overflow-hidden group border-b md:border-b-0 md:border-r border-[var(--rule-faint)]">
                <Image 
                  src="/_DSC0142.JPG" 
                  alt="Engjell Rraklli portrait - Tech entrepreneur and founder" 
                  fill
                  priority
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover img-classic group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--rich-black)]/80 md:hidden"></div>
              </div>
              {/* Bio Text Column */}
              <div className="md:col-span-8 p-8 md:p-10 flex flex-col justify-center relative">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <MapPin className="w-32 h-32 text-white" />
                </div>
                <div>
                  <Quote className="w-8 h-8 text-[var(--primary-mint)] mb-4 opacity-50" />
                  <h2 className="text-white font-bebas text-3xl mb-4 tracking-wide">Why I Build in Tirana</h2>
                  <p className="text-[var(--text-muted)] text-base md:text-[17px] leading-[1.72] max-w-2xl">
                    My mission is to empower young Albanian talent to build their future at home. By creating an ecosystem of world-class technology and software development in Tirana, I am providing the mentorship, structure, and opportunities the next generation needs to succeed without leaving the country.
                  </p>
                  {/* Evidence for the claim directly above it. The mission was
                      asserted on four pages and demonstrated on none. */}
                  <p className="mt-5 pl-4 border-l-2 border-[var(--primary-mint)] text-white text-sm font-medium leading-relaxed max-w-2xl">
                    <span className="font-bebas text-2xl tracking-wide text-[var(--primary-mint)] mr-2">THOUSANDS</span>
                    of job opportunities created for young Albanians over the past {yearsOfHiring()} years.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <Link href="/about" className="btn btn-secondary-on-image">
                    <BookOpen className="w-4 h-4" />
                    Read My Story
                  </Link>
                </div>
              </div>
            </div>

            {/* Start here.
                The homepage offers five competing calls to action and had no
                primary one. This is it: a single obvious next step for a first
                time visitor, and the only permanent home for the reference
                piece. Reads the same START_HERE_SLUG as the journal slot, so
                pinning a different post moves both, and unpinning removes both. */}
            {startHere && (
              <Link
                href={`/journal/${startHere.slug}`}
                className="group block mb-12 panel-inset border-[var(--primary-mint)]/45 hover:border-[var(--primary-mint)] transition-colors"
              >
                <div className="p-8 md:p-10">
                  <span className="section-label mb-3 block" style={{ color: "var(--primary-mint)" }}>
                    Start here
                  </span>
                  <h2 className="text-3xl md:text-4xl text-white font-bebas tracking-wide mb-3 group-hover:text-[var(--primary-mint)] transition-colors">
                    {startHere.title}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light max-w-3xl">
                    {startHere.excerpt}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 meta font-semibold text-[var(--primary-mint)]">
                    Read the playbook
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            )}

            {/* Metrics Strip.
                The counts double as the homepage's only body links to
                /ventures, /podcast and /journal. Previously the page
                advertised "3 Active" ventures and an article count while
                linking to neither section outside the footer. */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[var(--rule-faint)]">
              <div className="p-6 border-r border-[var(--rule-faint)] text-center">
                <p className="meta mb-1">Experience</p>
                <p className="text-3xl font-bebas text-white">{yearsOfBuilding()}+ Years</p>
              </div>
              <Link
                href="/ventures"
                className="p-6 border-r border-[var(--rule-faint)] text-center group hover:bg-[var(--content-bg)] transition-colors"
              >
                <p className="meta mb-1">Ventures</p>
                <p className="text-3xl font-bebas text-white group-hover:text-[var(--primary-mint)] transition-colors">
                  {VENTURE_COUNT} Active
                </p>
              </Link>
              {videoCount ? (
                <Link
                  href="/podcast"
                  className="p-6 border-r border-[var(--rule-faint)] text-center group hover:bg-[var(--content-bg)] transition-colors"
                >
                  <p className="meta mb-1">Podcast</p>
                  <p className="text-3xl font-bebas text-white group-hover:text-[var(--primary-mint)] transition-colors">
                    {videoCount} Episodes
                  </p>
                </Link>
              ) : (
                <div className="p-6 border-r border-[var(--rule-faint)] text-center">
                  <p className="meta mb-1">Mission</p>
                  <p className="text-3xl font-bebas text-white">Local Growth</p>
                </div>
              )}
              {blogCount ? (
                <Link href="/journal" className="p-6 text-center group hover:bg-[var(--content-bg)] transition-colors">
                  <p className="meta mb-1">Journal</p>
                  <p className="text-3xl font-bebas text-[var(--primary-mint)] group-hover:text-white transition-colors">
                    {blogCount} Articles
                  </p>
                </Link>
              ) : (
                <div className="p-6 text-center">
                  <p className="meta mb-1">Status</p>
                  <p className="text-3xl font-bebas text-[var(--primary-mint)]">Building</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Sidebar initialVideo={video} initialBlog={blog} />
    </div>
  );
}

