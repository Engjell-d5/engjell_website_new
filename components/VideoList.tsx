'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, ChevronDown } from 'lucide-react';
import { formatDateShort, formatDuration } from '@/lib/format';

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

interface VideoListProps {
  videos: YouTubeVideo[];
}

export default function VideoList({ videos }: VideoListProps) {
  const [videosToShow, setVideosToShow] = useState(3);

  const nextVideos = videos.slice(0, videosToShow);
  const hasMoreVideos = videos.length > videosToShow;

  // The full list is already in memory, reveal the next batch immediately.
  // This used to fake a 300ms spinner, which only delayed the content.
  const loadMoreVideos = () => setVideosToShow(prev => prev + 3);

  if (videos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-8 md:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {nextVideos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer block min-w-0"
            >
              <div className="relative aspect-video bg-black border border-[var(--border-color)] mb-2 overflow-hidden group-hover:border-[var(--primary-mint)] transition-colors">
                <Image 
                  src={video.thumbnailUrl} 
                  alt={`${video.title} - YouTube video thumbnail`} 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover img-classic opacity-60 group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[var(--primary-mint)] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-xs sm:text-sm text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2 break-words">
                {video.title}
              </h4>
              {/* 10px floor: the mobile size here was 8px, below the point
                  where this face stays legible at arm's length. */}
              <p className="text-[10px] text-[var(--text-meta)] mt-1 break-words">
                {formatDuration(video.duration)} • <time dateTime={new Date(video.publishedAt).toISOString()}>{formatDateShort(video.publishedAt)}</time>
              </p>
            </a>
          ))}
        </div>
        {hasMoreVideos && (
          <div className="mt-6 md:mt-8 flex justify-center">
            <button
              onClick={loadMoreVideos}
              className="bg-white text-black hover:bg-[var(--primary-mint)] px-4 md:px-6 py-2 md:py-3 text-xs font-bold uppercase tracking-widest transition-colors rounded-none flex items-center justify-center gap-2 min-h-[44px]"
            >
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
}

