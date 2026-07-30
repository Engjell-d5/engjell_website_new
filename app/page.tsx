import Image from 'next/image';
import Link from 'next/link';
import { Quote, MapPin, BookOpen, Play } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { createMetadata } from '@/lib/metadata';
import { getBlogs, getVideos } from '@/lib/data';
import { yearsOfBuilding } from '@/lib/site';
import type { Metadata } from 'next';

// Rendered per request — see app/journal/page.tsx for why ISR is not used.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  description: 'Engjell Rraklli - Albanian tech entrepreneur building scalable technology in Tirana. Software development, startups, and tech innovation in Albania.',
  path: '/',
});

// Fetch the freshest video and blog server-side so the homepage's newest
// internal links are in the initial HTML (crawlable) instead of a client fetch.
// Only the fields the sidebar renders are passed to the client component —
// never the full blog (its `content` would bloat the page payload).
async function loadLatestContent() {
  if (!process.env.DATABASE_URL) return { video: null, blog: null };
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
    return { video, blog };
  } catch (err) {
    console.error('[home] loading latest content failed:', err);
    return { video: null, blog: null };
  }
}

export default async function Home() {
  const { video, blog } = await loadLatestContent();
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Home</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            IF IT WAS EASY, EVERYONE WOULD DO IT.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            {/* Full Width Hero */}
            <div className="relative w-[calc(100%+3rem)] md:w-[calc(100%+5rem)] h-[600px] border-b border-[var(--border-color)] overflow-hidden group mb-8 -ml-6 -mr-6 -mt-6 md:-ml-10 md:-mr-10 md:-mt-10 rounded-none">
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
                  <span className="bg-[var(--primary-mint)] text-[var(--rich-black)] text-[10px] font-bold px-3 py-1 uppercase tracking-widest inline-block">Founder's Note</span>
                </div>
                <h1 className="text-6xl md:text-8xl text-white font-bebas leading-[0.85] tracking-tight max-w-4xl">
                  BUILDING THE<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">FUTURE</span><br />
                  IN ALBANIA.
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href="/media" className="px-6 py-3 bg-[var(--primary-mint)] text-[var(--rich-black)] hover:bg-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    Listen to the Podcast
                  </Link>
                  <Link href="/contact" className="px-6 py-3 border border-white/40 text-white hover:border-[var(--primary-mint)] hover:text-[var(--primary-mint)] text-[10px] font-bold uppercase tracking-widest transition-colors">
                    Work With Me
                  </Link>
                </div>
              </div>
            </div>

            {/* Bio Grid (Split Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 mb-8 border border-[var(--border-color)] bg-[var(--rich-black)] rounded-none overflow-hidden">
              {/* Portrait Image Column */}
              <div className="md:col-span-4 h-64 md:h-auto relative overflow-hidden group border-b md:border-b-0 md:border-r border-[var(--border-color)]">
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
                  <p className="text-gray-300 text-sm leading-relaxed font-light max-w-2xl">
                    My mission is to empower young Albanian talent to build their future at home. By creating an ecosystem of world-class technology and software development in Tirana, I am providing the mentorship, structure, and opportunities the next generation needs to succeed without leaving the country.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <Link href="/about" className="px-6 py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Read My Story
                  </Link>
                </div>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-[var(--border-color)] bg-[var(--rich-black)]">
              <div className="p-6 border-r border-[var(--border-color)] text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Experience</p>
                <p className="text-3xl font-bebas text-white">{yearsOfBuilding()}+ Years</p>
              </div>
              <div className="p-6 border-r border-[var(--border-color)] text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ventures</p>
                <p className="text-3xl font-bebas text-white">3 Active</p>
              </div>
              <div className="p-6 border-r border-[var(--border-color)] text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Mission</p>
                <p className="text-3xl font-bebas text-white">Local Growth</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                <p className="text-3xl font-bebas text-[var(--primary-mint)]">Building</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Sidebar initialVideo={video} initialBlog={blog} />
    </div>
  );
}

