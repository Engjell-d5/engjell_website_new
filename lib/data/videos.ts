import type { YouTubeVideo } from './types';

/**
 * Podcast episodes, read from d5.
 *
 * This site no longer talks to YouTube at all. d5 owns the channel
 * connection, the nightly sync and the curation flags (featured, removed),
 * exactly as it owns the blog content this site already renders. One
 * fetcher, one quota, one place to curate; the site is a reader.
 *
 * The site's own youtube_videos table, its fetch cron and its API key are
 * retired with this change. Write paths (feature, hide, refresh) live in
 * d5 under Settings -> Companies -> YouTube.
 */
const D5_API_URL = (process.env.D5_API_URL || 'https://app.division5.co/api/v1').replace(/\/+$/, '');
const D5_API_KEY = process.env.D5_API_KEY || '';
// The engjell-rraklli company in d5. Scopes the call so another tenant's
// videos can never appear here.
const D5_COMPANY_ID = process.env.D5_COMPANY_ID || 'cc640cdd-4a92-412b-ba9a-4ad48ae6e9cf';

/** How stale the rendered page may get before Next revalidates against d5. */
const REVALIDATE_SECONDS = 300;

interface D5Video {
  videoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  publishedAt: string;
  duration: string | null;
  durationSeconds: number | null;
  viewCount: number | null;
  featured: boolean;
  url: string;
}

interface D5VideosResponse {
  channel: { channelId: string; title: string | null; thumbnailUrl: string | null; url: string } | null;
  data: D5Video[];
}

async function fetchD5Videos(): Promise<D5VideosResponse | null> {
  if (!D5_API_KEY) {
    console.error('[videos] D5_API_KEY is not set; podcast content cannot load');
    return null;
  }
  try {
    const res = await fetch(
      `${D5_API_URL}/content/youtube/videos/public?companyId=${D5_COMPANY_ID}&pageSize=100`,
      {
        headers: { 'X-API-Key': D5_API_KEY },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) {
      console.error(`[videos] d5 answered ${res.status}`);
      return null;
    }
    return (await res.json()) as D5VideosResponse;
  } catch (error) {
    console.error('[videos] failed to reach d5:', error);
    return null;
  }
}

function toSiteVideo(v: D5Video, channelTitle: string): YouTubeVideo {
  return {
    id: v.videoId,
    videoId: v.videoId,
    title: v.title,
    description: v.description ?? '',
    thumbnailUrl: v.thumbnailUrl ?? '',
    publishedAt: v.publishedAt,
    duration: v.duration ?? '',
    viewCount: String(v.viewCount ?? 0),
    channelTitle,
    fetchedAt: new Date().toISOString(),
    featured: v.featured,
    removed: false,
  };
}

/**
 * Long-form videos, featured first then newest — the same ordering the
 * local table used, applied server-side by d5. Removed videos never leave
 * d5, so there is nothing to filter here; the includeRemoved parameter of
 * the old implementation is gone with the write paths.
 */
/**
 * Episodes only. The channel uploads clips as well as episodes, and the
 * clips are 1-4 minutes: long enough to escape d5's Shorts filter, far
 * short of the 20-plus-minute episodes. Four minutes sits in the gap, so
 * this floor reproduces exactly the episode list the site showed before
 * the cutover. A video d5 serves without a parsed duration is kept: better
 * an extra row than a silently vanished episode.
 */
const MIN_EPISODE_SECONDS = 240;

export async function getVideos(): Promise<YouTubeVideo[]> {
  const res = await fetchD5Videos();
  if (!res || !res.channel) return [];
  const channelTitle = res.channel.title ?? '';
  return res.data
    .filter((v) => v.durationSeconds == null || v.durationSeconds >= MIN_EPISODE_SECONDS)
    .map((v) => toSiteVideo(v, channelTitle));
}

export async function getFeaturedVideo(): Promise<YouTubeVideo | null> {
  const videos = await getVideos();
  return videos.find((v) => v.featured) ?? null;
}
