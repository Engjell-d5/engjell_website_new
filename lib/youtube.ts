import { getConfig, saveConfig, getVideos, saveVideos, YouTubeVideo } from './data';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyDgbtLr1LWAF0aIq4uXmgeY2MRAJSlJ6g0';
const CHANNEL_HANDLE = '@engjellrraklli';

export async function getChannelIdFromHandle(handle: string): Promise<string | null> {
  try {
    // Try method 1: Use channels.list with forHandle (newer API)
    try {
      const handleWithoutAt = handle.replace('@', '');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handleWithoutAt}&key=${YOUTUBE_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          console.log('Found channel ID via forHandle:', data.items[0].id);
          return data.items[0].id;
        }
      }
    } catch (e) {
      console.log('forHandle method failed, trying search...');
    }

    // Try method 2: Use search endpoint
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      throw new Error(`Failed to fetch channel: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Search response:', JSON.stringify(data, null, 2));
    
    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].snippet.channelId;
      console.log('Found channel ID via search:', channelId);
      return channelId;
    }
    
    console.warn('No channel found in search results');
    return null;
  } catch (error: any) {
    console.error('Error fetching channel ID:', error.message || error);
    return null;
  }
}

export async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  try {
    const config = await getConfig();
    let channelId = config.youtubeChannelId;

    console.log('Starting YouTube video fetch...');
    console.log('Current channel ID:', channelId || 'Not set');

    // If we don't have channel ID, fetch it from handle
    if (!channelId) {
      console.log('Fetching channel ID from handle:', CHANNEL_HANDLE);
      const fetchedChannelId = await getChannelIdFromHandle(CHANNEL_HANDLE);
      if (fetchedChannelId) {
        channelId = fetchedChannelId;
        config.youtubeChannelId = channelId;
        await saveConfig(config);
        console.log('Channel ID saved:', channelId);
      } else {
        throw new Error('Could not find channel ID for handle: ' + CHANNEL_HANDLE);
      }
    }

    // Fetch uploads playlist ID
    console.log('Fetching channel details for ID:', channelId);
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelResponse.ok) {
      const errorData = await channelResponse.json();
      console.error('Channel details error:', errorData);
      throw new Error(`Failed to fetch channel details: ${channelResponse.status} ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();
    console.log('Channel data received:', channelData.items?.length || 0, 'items');
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('Channel not found or has no content');
    }

    // Use search API with videoDuration filter to exclude Shorts
    // videoDuration=medium (4-20 min) and long (>20 min) exclude Shorts
    console.log('Fetching videos using search API (excluding Shorts)...');
    
    // Fetch videos using search API with duration filter
    // Make separate calls for medium and long durations, then combine
    let allVideoIds: string[] = [];
    const videoDurations: ('medium' | 'long')[] = ['medium', 'long'];
    
    for (const duration of videoDurations) {
      let nextPageToken: string | undefined = undefined;
      let pageCount = 0;
      
      // Fetch multiple pages for each duration type
      while (pageCount < 2) { // Limit to 2 pages per duration type
        const searchUrl: string = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=50&videoDuration=${duration}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        
        const searchResponse: Response = await fetch(searchUrl);
        
        if (!searchResponse.ok) {
          const errorData = await searchResponse.json();
          console.error(`Search API error for ${duration}:`, errorData);
          break; // Continue with next duration type
        }
        
        const searchData: any = await searchResponse.json();
        if (!searchData.items || searchData.items.length === 0) {
          break; // No more items
        }
        
        const pageVideoIds = searchData.items.map((item: any) => item.id.videoId);
        allVideoIds = [...allVideoIds, ...pageVideoIds];
        
        console.log(`${duration} duration: Found ${pageVideoIds.length} videos (total so far: ${allVideoIds.length})`);
        
        nextPageToken = searchData.nextPageToken;
        if (!nextPageToken) break; // No more pages
        
        pageCount++;
      }
    }
    
    // Remove duplicates (in case a video appears in both medium and long)
    allVideoIds = [...new Set(allVideoIds)];
    
    if (allVideoIds.length === 0) {
      console.warn('No videos found (excluding Shorts)');
      return [];
    }
    
    console.log(`Total unique video IDs to fetch details for: ${allVideoIds.length}`);
    
    // Process video IDs in batches of 50 (API limit)
    const videoIds = allVideoIds.slice(0, 50).join(',');
    console.log('Video IDs to fetch details for:', videoIds.split(',').length);

    // Fetch detailed video information
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!detailsResponse.ok) {
      const errorData = await detailsResponse.json();
      console.error('Video details error:', errorData);
      throw new Error(`Failed to fetch video details: ${detailsResponse.status} ${detailsResponse.statusText}`);
    }

    const detailsData = await detailsResponse.json();
    console.log('Video details received:', detailsData.items?.length || 0, 'items');

    if (!detailsData.items || detailsData.items.length === 0) {
      console.warn('No video details returned');
      return [];
    }

    // Helper function to parse ISO 8601 duration to seconds
    const parseDurationToSeconds = (duration: string): number => {
      if (!duration) return 0;
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) {
        console.warn('Could not parse duration:', duration);
        return 0;
      }
      const hours = parseInt(match[1] || '0', 10);
      const minutes = parseInt(match[2] || '0', 10);
      const seconds = parseInt(match[3] || '0', 10);
      return hours * 3600 + minutes * 60 + seconds;
    };

    // Transform to our format
    const allVideos: YouTubeVideo[] = detailsData.items.map((item: any) => {
      // Get highest quality thumbnail available
      // Priority: maxres (1280x720) > standard (640x480) > high (480x360) > medium (320x180) > default (120x90)
      const thumbnails = item.snippet.thumbnails;
      const thumbnailUrl = thumbnails.maxres?.url || 
                          thumbnails.standard?.url || 
                          thumbnails.high?.url || 
                          thumbnails.medium?.url || 
                          thumbnails.default?.url || '';
      
      return {
        id: item.id,
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        viewCount: item.statistics.viewCount || '0',
        channelTitle: item.snippet.channelTitle,
        fetchedAt: new Date().toISOString(),
      };
    });

    // Additional filter for any Shorts that might have slipped through
    // (though videoDuration=medium,long should have excluded them)
    const videos = allVideos.filter((video) => {
      const durationInSeconds = parseDurationToSeconds(video.duration);
      const isShort = durationInSeconds <= 60 || 
                     video.title.toLowerCase().includes('#shorts') ||
                     video.title.toLowerCase().includes('shorts');
      
      if (isShort) {
        console.log(`Additional filter: Removed Short "${video.title}" (${durationInSeconds}s)`);
      }
      
      return !isShort;
    });

    console.log(`Successfully processed ${videos.length} videos (using videoDuration=medium,long filter)`);

    // Save videos
    await saveVideos(videos);

    // Update config
    config.lastVideoFetch = new Date().toISOString();
    await saveConfig(config);

    return videos;
  } catch (error: any) {
    console.error('Error fetching YouTube videos:', error.message || error);
    throw error;
  }
}


