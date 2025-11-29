import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { fetchYouTubeVideos } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const videos = await fetchYouTubeVideos();
    return NextResponse.json({ 
      success: true, 
      count: videos.length,
      videos,
      message: videos.length > 0 
        ? `Successfully fetched ${videos.length} videos` 
        : 'No videos found. Check console logs for details.'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch YouTube videos',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

