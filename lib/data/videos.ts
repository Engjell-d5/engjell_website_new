import { prisma } from '../prisma';
import type { YouTubeVideo } from './types';

export async function getVideos(includeRemoved: boolean = false): Promise<YouTubeVideo[]> {
  const where = includeRemoved ? {} : { removed: false };
  const videos = await prisma.youTubeVideo.findMany({
    where,
    orderBy: [
      { featured: 'desc' }, // Featured videos first
      { publishedAt: 'desc' }, // Then by published date
    ],
  });
  type VideoType = Awaited<ReturnType<typeof prisma.youTubeVideo.findMany>>[0];
  return videos.map((video: VideoType) => ({
    id: video.id,
    videoId: video.videoId,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt.toISOString(),
    duration: video.duration,
    viewCount: video.viewCount,
    channelTitle: video.channelTitle,
    fetchedAt: video.fetchedAt.toISOString(),
    featured: video.featured,
    removed: video.removed,
  }));
}

export async function getFeaturedVideo(): Promise<YouTubeVideo | null> {
  const video = await prisma.youTubeVideo.findFirst({
    where: { 
      featured: true,
      removed: false,
    },
    orderBy: { publishedAt: 'desc' },
  });
  
  if (!video) return null;
  
  return {
    id: video.id,
    videoId: video.videoId,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt.toISOString(),
    duration: video.duration,
    viewCount: video.viewCount,
    channelTitle: video.channelTitle,
    fetchedAt: video.fetchedAt.toISOString(),
    featured: video.featured,
    removed: video.removed,
  };
}

export async function setVideoFeatured(videoId: string, featured: boolean): Promise<void> {
  // If setting as featured, unfeature all other videos first
  if (featured) {
    await prisma.youTubeVideo.updateMany({
      where: { featured: true },
      data: { featured: false },
    });
  }
  
  await prisma.youTubeVideo.update({
    where: { videoId },
    data: { featured },
  });
}

export async function removeVideo(videoId: string): Promise<void> {
  await prisma.youTubeVideo.update({
    where: { videoId },
    data: { removed: true },
  });
}

export async function restoreVideo(videoId: string): Promise<void> {
  await prisma.youTubeVideo.update({
    where: { videoId },
    data: { removed: false },
  });
}

export async function saveVideos(videos: YouTubeVideo[]): Promise<void> {
  for (const video of videos) {
    await prisma.youTubeVideo.upsert({
      where: { videoId: video.videoId },
      update: {
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: new Date(video.publishedAt),
        duration: video.duration,
        viewCount: video.viewCount,
        channelTitle: video.channelTitle,
        fetchedAt: new Date(video.fetchedAt),
        // Preserve featured and removed status if they exist, otherwise keep existing values
        ...(video.featured !== undefined && { featured: video.featured }),
        ...(video.removed !== undefined && { removed: video.removed }),
      },
      create: {
        id: video.id,
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: new Date(video.publishedAt),
        duration: video.duration,
        viewCount: video.viewCount,
        channelTitle: video.channelTitle,
        fetchedAt: new Date(video.fetchedAt),
        featured: video.featured || false,
        removed: video.removed || false,
      },
    });
  }
}

