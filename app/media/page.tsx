import Image from 'next/image';
import { Play, ExternalLink, Quote } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import VideoList from '@/components/VideoList';
import PodcastApplicationButton from '@/components/PodcastApplicationButton';
import { getVideos } from '@/lib/data';

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

export default async function Media() {
  // Fetch videos server-side
  const allVideos = await getVideos(false); // Exclude removed videos
  
  // Get featured video (first video is featured, as returned by API sorted by featured first)
  const featuredVideo = allVideos.find(v => v.featured) || allVideos[0];
  // Get other videos (excluding featured)
  const otherVideos = allVideos.filter(v => !v.featured || v.id !== featuredVideo?.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      {/* Left Panel - Latest Video */}
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh] order-2 md:order-1 min-w-0">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-400 min-w-0">
            <span className="text-[var(--primary-mint)] font-bold flex-shrink-0">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[10px] md:text-[11px] truncate">Media</span>
          </div>
          <div className="font-montserrat text-[9px] md:text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden lg:block whitespace-nowrap">
            SMALL STEPS EVERYDAY BEATS 1 BIG STEP A YEAR.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 lg:p-10 min-w-0">
          <section className="animate-slide-up min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8 border-b border-[var(--border-color)] pb-4">
              <div className="min-w-0">
                <span className="page-label mb-2 md:mb-3 block">Media</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bebas break-words">THE CONVERSATION</h1>
              </div>
              <a 
                href="https://www.youtube.com/@engjellrraklli" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black hover:bg-[var(--primary-mint)] px-4 md:px-6 py-2 md:py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none flex items-center justify-center gap-2 w-full md:w-auto flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                Visit Channel
              </a>
            </div>

            {allVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No videos available. Check back soon!</p>
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
                  <span className="bg-[var(--primary-mint)] text-black text-[8px] md:text-[9px] font-bold px-2 py-1 uppercase tracking-widest mb-2 md:mb-3 inline-block">Latest Video</span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bebas tracking-wide break-words line-clamp-2 md:line-clamp-none">{featuredVideo.title}</h3>
                </div>
              </a>
            ) : null}

            {/* More Videos Section */}
            {otherVideos.length > 0 && <VideoList videos={otherVideos} />}
          </section>
        </div>
      </main>

       {/* Right Panel - Next 3 Videos */}
       <aside className="classic-panel md:col-span-3 flex flex-col p-4 md:p-6 gap-4 md:gap-6 bg-[var(--rich-black)] sticky-sidebar order-1 md:order-2 md:min-h-[80vh]">
         <div className="flex flex-col gap-4 md:gap-6 sticky-sidebar-content min-w-0">
        {/* Description */}
        <div className="relative p-4 md:p-6 border-l-4 border-[var(--primary-mint)] bg-[var(--rich-black)] min-w-0 overflow-hidden">
          <div className="absolute top-2 left-4 opacity-20">
            <Quote className="w-8 h-8 md:w-12 md:h-12 text-[var(--primary-mint)]" />
          </div>
          <div className="relative z-10 min-w-0">
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light italic pl-8 md:pl-10 pt-3 md:pt-4 break-words overflow-wrap-anywhere">
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
