'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PenTool, CalendarPlus, History, Contact, Mail, MapPin, Clock, Linkedin, Twitter, Play, Briefcase, Quote } from 'lucide-react';
import { yearsOfBuilding, FOUNDING_YEAR } from '@/lib/site';
import { VENTURE_COUNT } from '@/lib/ventures';
import { formatDateShort, formatDuration } from '@/lib/format';
import SubscribeForm from '@/components/SubscribeForm';

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

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  published: boolean;
  publishedAt: string | null;
}

// Routes with a purpose-built panel below. '/journal' matches its subtree.
const KNOWN_SIDEBAR_ROUTES = ['/', '/about', '/journal', '/ventures', '/contact'] as const;

interface SidebarProps {
  // When the page already fetched these server-side (homepage), pass them in
  // so the content is in the initial HTML and no client fetch happens.
  initialVideo?: YouTubeVideo | null;
  initialBlog?: Blog | null;
}

export default function Sidebar({ initialVideo, initialBlog }: SidebarProps = {}) {
  const pathname = usePathname();
  const hasServerData = initialVideo !== undefined || initialBlog !== undefined;
  const [latestVideo, setLatestVideo] = useState<YouTubeVideo | null>(initialVideo ?? null);
  const [loadingVideo, setLoadingVideo] = useState(!hasServerData);
  const [latestBlog, setLatestBlog] = useState<Blog | null>(initialBlog ?? null);
  const [loadingBlog, setLoadingBlog] = useState(!hasServerData);

  useEffect(() => {
    if (pathname === '/' && !hasServerData) {
      fetchLatestVideo();
      fetchLatestBlog();
    }
  }, [pathname, hasServerData]);

  const fetchLatestVideo = async () => {
    try {
      const response = await fetch('/api/youtube/videos');
      if (response.ok) {
        const data = await response.json();
        const videos = data.videos || [];
        // Get featured video (first video is featured, as returned by API sorted by featured first)
        // Fallback to first video if no featured video exists
        const featured = videos.find((v: YouTubeVideo) => v.featured) || videos[0];
        if (featured) {
          setLatestVideo(featured);
        }
      }
    } catch (error) {
      console.error('Error fetching latest video:', error);
    } finally {
      setLoadingVideo(false);
    }
  };

  const fetchLatestBlog = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        // Filter published blogs and sort by publishedAt, most recent first
        const publishedBlogs = (data.blogs || [])
          .filter((blog: Blog) => blog.published)
          .sort((a: Blog, b: Blog) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          });
        if (publishedBlogs.length > 0) {
          setLatestBlog(publishedBlogs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching latest blog:', error);
    } finally {
      setLoadingBlog(false);
    }
  };


  // Every route that renders this component now has a panel worth showing
  // (the fallback branch covers the rest), so it is always visible — the old
  // allow-list also named '/podcast', which has its own aside and never
  // renders this component at all.
  
  return (
    <aside className="classic-panel md:col-span-3 flex flex-col p-6 gap-6 bg-[var(--bg-dark)] sticky-sidebar md:min-h-[80vh]">
      {/* HOME SIDEBAR */}
      {pathname === '/' && (
        <div className="flex flex-col gap-6 sticky-sidebar-content">
          {/* Quick Action - Book Me for Events */}
          <Link href="/contact" className="w-full py-3 bg-[var(--primary-mint)] text-black hover:bg-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            Book Me for Events
          </Link>

          {/* Latest Video */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-[var(--text-meta)] uppercase tracking-widest">Latest Video</span>
              <Play className="w-4 h-4 text-[var(--text-meta)]" />
            </div>
            {loadingVideo ? (
              <div className="animate-pulse">
                <div className="aspect-video bg-gray-800 border border-[var(--border-color)] mb-2 rounded-none"></div>
                <div className="h-4 w-full bg-gray-800 rounded-none mb-1"></div>
                <div className="h-3 w-24 bg-gray-800 rounded-none"></div>
              </div>
            ) : latestVideo ? (
              <a
                href={`https://www.youtube.com/watch?v=${latestVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer block"
              >
                <div className="aspect-video bg-black border border-[var(--border-color)] mb-2 overflow-hidden relative group-hover:border-[var(--primary-mint)] transition-colors">
                  <Image 
                    src={latestVideo.thumbnailUrl} 
                    alt={latestVideo.title} 
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[var(--primary-mint)] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2">
                  {latestVideo.title}
                </p>
                <p className="text-[10px] text-[var(--text-meta)] mt-1">
                  {formatDuration(latestVideo.duration)} • YouTube
                </p>
              </a>
            ) : (
              <div className="aspect-video bg-black border border-[var(--border-color)] flex items-center justify-center">
                <p className="text-[var(--text-meta)] text-xs">No videos available</p>
              </div>
            )}
          </div>

          {/* Latest Blog */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-[var(--text-meta)] uppercase tracking-widest">Latest Blog</span>
              <PenTool className="w-4 h-4 text-[var(--text-meta)]" />
            </div>
            {loadingBlog ? (
              <div className="animate-pulse">
                <div className="aspect-[2/1] bg-gray-800 border border-[var(--border-color)] mb-2 rounded-none"></div>
                <div className="h-4 w-full bg-gray-800 rounded-none mb-1"></div>
                <div className="h-3 w-32 bg-gray-800 rounded-none"></div>
              </div>
            ) : latestBlog ? (
              <Link
                href={`/journal/${latestBlog.slug}`}
                className="group block"
              >
                <div className="aspect-[2/1] bg-black border border-[var(--border-color)] mb-2 overflow-hidden relative group-hover:border-[var(--primary-mint)] transition-colors">
                  <Image
                    src={latestBlog.imageUrl}
                    alt={latestBlog.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                  />
                </div>
                <p className="text-xs text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2">
                  {latestBlog.title}
                </p>
                <p className="text-[10px] text-[var(--text-meta)] mt-1">
                  {formatDateShort(latestBlog.publishedAt)} • {latestBlog.category}
                </p>
              </Link>
            ) : (
              <div className="aspect-[2/1] bg-black border border-[var(--border-color)] flex items-center justify-center">
                <p className="text-[var(--text-meta)] text-xs">No blog posts available</p>
              </div>
            )}
          </div>

          {/* The homepage is the highest-traffic page and had no way to
              subscribe — the form only existed on /journal and post pages. */}
          <SubscribeForm />
        </div>
      )}

      {/* ABOUT SIDEBAR */}
      {pathname === '/about' && (
        <div className="flex flex-col gap-6 sticky-sidebar-content">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-[var(--text-meta)] uppercase tracking-widest">Timeline</span>
              <History className="w-4 h-4 text-[var(--text-meta)]" />
            </div>
            {/* Newest entry first. Keep the top item current — a timeline whose
                latest milestone is in the past reads as an abandoned site. */}
            <div className="space-y-4">
              <div className="relative pl-4 border-l border-[var(--border-color)]">
                <div className="absolute -left-1 top-1 w-2 h-2 bg-[var(--primary-mint)] rounded-full"></div>
                <p className="text-[10px] text-[var(--text-meta)] mb-1">{new Date().getFullYear()}</p>
                <p className="text-xs text-white font-bold">Scaling division5 &amp; divisionAI</p>
              </div>
              <div className="relative pl-4 border-l border-[var(--border-color)]">
                <div className="absolute -left-1 top-1 w-2 h-2 bg-[var(--text-meta)] rounded-full"></div>
                <p className="text-[10px] text-[var(--text-meta)] mb-1">2022</p>
                <p className="text-xs text-white font-bold">Launched divisionAI</p>
              </div>
              <div className="relative pl-4 border-l border-[var(--border-color)]">
                <div className="absolute -left-1 top-1 w-2 h-2 bg-[var(--primary-mint)] rounded-full"></div>
                <p className="text-[10px] text-[var(--text-meta)] mb-1">{FOUNDING_YEAR}</p>
                <p className="text-xs text-white font-bold">First Venture Founded</p>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
              <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-widest mb-1">Years Active</p>
              <p className="text-2xl font-bebas text-white">{yearsOfBuilding()}+</p>
            </div>
          </div>
        </div>
      )}

      {/* JOURNAL SIDEBAR */}
      {(pathname === '/journal' || pathname.startsWith('/journal/')) && (
        <div className="flex flex-col gap-6 sticky-sidebar-content">
          {pathname === '/journal' && (
            <div className="relative p-6 border-l-4 border-[var(--primary-mint)] bg-[var(--rich-black)]">
              <div className="absolute top-2 left-4 opacity-20">
                <Quote className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[var(--primary-mint)]" />
              </div>
              <div className="relative z-10">
                <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light italic pl-4 md:pl-0 lg:pl-10 pt-2 md:pt-4">
                  "When I started as an entrepreneur, I constantly craved a mentor to help me make sense of the chaos. I'm documenting the lessons I've learned so you can navigate your own journey with a little more clarity and a little less stress."
                </p>
              </div>
            </div>
          )}
        <SubscribeForm />
        </div>
      )}

      {/* VENTURES SIDEBAR */}
      {pathname === '/ventures' && (
        <div className="flex flex-col gap-6 sticky-sidebar-content">
          <div className="relative p-6 border-l-4 border-[var(--primary-mint)] bg-[var(--rich-black)]">
            <div className="absolute top-2 left-4 opacity-20">
              <Quote className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[var(--primary-mint)]" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light italic pl-4 md:pl-0 lg:pl-10 pt-2 md:pt-4">
                "I specialize in scaling next-generation digital agencies. Through division5 and divisionAI, I deliver software services and AI solutions."
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-[var(--text-meta)] uppercase tracking-widest">Quick Stats</span>
              <Briefcase className="w-4 h-4 text-[var(--text-meta)]" />
            </div>
            <div className="space-y-3">
              <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
                <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-widest mb-1">Total Experience</p>
                <p className="text-2xl font-bebas text-white">{yearsOfBuilding()}+ Years</p>
              </div>
              <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
                <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-widest mb-1">Active Ventures</p>
                <p className="text-2xl font-bebas text-white">{VENTURE_COUNT}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
              <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-widest mb-1">Location</p>
              <p className="text-sm font-bebas text-white">Tirana, Albania</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT SIDEBAR */}
      {pathname === '/contact' && (
        <div className="flex flex-col gap-6 sticky-sidebar-content">
          <div className="border border-[var(--border-color)] bg-[var(--rich-black)] p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Contact Details</span>
              <Contact className="w-4 h-4 text-[var(--text-meta)]" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[var(--primary-mint)] mt-0.5" />
                <div>
                  <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-wide">Email</p>
                  <a href="mailto:info@engjellrraklli.com" className="text-xs text-white hover:text-[var(--primary-mint)] transition-colors">info@engjellrraklli.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--text-meta)] mt-0.5" />
                <div>
                  <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-wide">Location</p>
                  <p className="text-xs text-white">Tirana, Albania</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[var(--primary-mint)] mt-0.5" />
                <div>
                  <p className="text-[10px] text-[var(--text-meta)] uppercase tracking-wide">Office Hours</p>
                  <p className="text-xs text-white">Mon - Fri, 9AM - 5PM CET</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex gap-2">
              <a href="https://www.linkedin.com/in/engjell-rraklli-a8b20a68/" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-[var(--border-color)] hover:bg-[var(--primary-mint)] hover:text-black rounded-none flex items-center justify-center text-[var(--text-meta)] transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://x.com/RraklliEngjell" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-[var(--border-color)] hover:bg-[var(--primary-mint)] hover:text-black rounded-none flex items-center justify-center text-[var(--text-meta)] transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FALLBACK — any route without a dedicated panel (e.g. the 404 page)
          rendered an empty bordered box. Give it something useful instead. */}
      {!KNOWN_SIDEBAR_ROUTES.some((p) => (p === '/journal' ? pathname.startsWith('/journal') : pathname === p)) && (
        <div className="flex flex-col gap-6 sticky-sidebar-content">
          <SubscribeForm />
        </div>
      )}
    </aside>
  );
}

