'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Mic, X, ExternalLink, ChevronDown, Quote } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import PodcastApplicationForm from '@/components/PodcastApplicationForm';
// Format duration helper
const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

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
}

export default function Media() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videosToShow, setVideosToShow] = useState(3);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/youtube/videos');
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const featuredVideo = videos[0];
  const nextVideos = videos.slice(1, videosToShow + 1); // Videos after featured
  const hasMoreVideos = videos.length > videosToShow + 1;
  
  const loadMoreVideos = () => {
    setLoadingMore(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setVideosToShow(prev => prev + 3);
      setLoadingMore(false);
    }, 300);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Left Panel - Latest Video */}
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh] order-2 md:order-1">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Media</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            SMALL STEPS EVERYDAY BEATS 1 BIG STEP A YEAR.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="page-label mb-3 block">Media</span>
                <h1 className="text-5xl md:text-6xl text-white font-bebas">THE CONVERSATION</h1>
              </div>
              <a 
                href="https://www.youtube.com/@engjellrraklli" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black hover:bg-[var(--primary-mint)] px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Channel
              </a>
            </div>

            {!mounted || loading ? (
              <div className="space-y-6">
                {/* Featured video skeleton */}
                <div className="relative w-full aspect-video border border-[var(--border-color)] bg-gray-900 animate-pulse">
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                    <div className="h-3 w-20 bg-gray-700 mb-3 rounded-none"></div>
                    <div className="h-10 w-3/4 bg-gray-700 mb-2 rounded-none"></div>
                    <div className="h-4 w-full bg-gray-700 rounded-none"></div>
                  </div>
                </div>
              </div>
            ) : videos.length === 0 ? (
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
                  className="object-cover img-classic opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-20 h-20 border border-[var(--border-color)] flex items-center justify-center rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 text-white">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                  <span className="bg-[var(--primary-mint)] text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest mb-3 inline-block">Latest Video</span>
                  <h3 className="text-4xl text-white font-bebas tracking-wide">{featuredVideo.title}</h3>
                  <p className="text-gray-300 text-sm mt-2 max-w-2xl font-light line-clamp-2">
                    {featuredVideo.description}
                  </p>
                </div>
              </a>
            ) : null}

            {/* More Videos Section */}
            {!mounted || loading ? null : nextVideos.length > 0 && (
              <div className="mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextVideos.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer block"
              >
                <div className="relative aspect-video bg-black border border-[var(--border-color)] mb-2 overflow-hidden group-hover:border-[var(--primary-mint)] transition-colors">
                  <Image 
                    src={video.thumbnailUrl} 
                    alt={`${video.title} - YouTube video thumbnail`} 
                    fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover img-classic opacity-60 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[var(--primary-mint)] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-sm text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-[9px] text-gray-500 mt-1">
                  {formatDuration(video.duration)} • <time dateTime={new Date(video.publishedAt).toISOString()}>{formatDate(video.publishedAt)}</time>
                </p>
              </a>
            ))}
                </div>
                {loadingMore && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-video bg-gray-800 border border-[var(--border-color)] mb-2 rounded-none"></div>
                        <div className="h-4 w-full bg-gray-800 rounded-none mb-1"></div>
                        <div className="h-3 w-24 bg-gray-800 rounded-none"></div>
                      </div>
                    ))}
                  </div>
                )}
                {hasMoreVideos && !loadingMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={loadMoreVideos}
                      className="bg-white text-black hover:bg-[var(--primary-mint)] px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none flex items-center justify-center gap-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Load More
                    </button>
                  </div>
                )}
          </div>
        )}
          </section>
        </div>
      </main>

      {/* Right Panel - Next 3 Videos */}
      <aside className="classic-panel md:col-span-3 flex flex-col p-6 gap-6 bg-[var(--rich-black)] sticky-sidebar order-1 md:order-2">
        {/* Description */}
        <div className="relative p-6 border-l-4 border-[var(--primary-mint)] bg-[var(--rich-black)]">
          <div className="absolute top-2 left-4 opacity-20">
            <Quote className="w-12 h-12 text-[var(--primary-mint)]" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-gray-300 leading-relaxed font-light italic pl-10 pt-4">
              "I talk about how to run a business which is more human, which provides real value, and which scales without losing its soul. I am a big believer that businesses should love problems first and make a profit next."
            </p>
          </div>
        </div>

        {/* Apply to Podcast Button */}
        <button
          onClick={() => setShowApplicationModal(true)}
          className="w-full py-3 bg-white text-black hover:bg-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <Mic className="w-4 h-4" />
          Apply to Podcast
        </button>
      </aside>

      {/* Podcast Application Modal */}
      {showApplicationModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-[99999] flex items-start justify-center overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowApplicationModal(false);
            }
          }}
        >
          <div className="classic-panel bg-[var(--rich-black)] w-full max-w-2xl my-8 relative">
            <button
              onClick={() => setShowApplicationModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <PodcastApplicationForm onSuccess={() => setShowApplicationModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

