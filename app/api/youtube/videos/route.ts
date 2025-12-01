import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getVideos, saveVideos, setVideoFeatured, removeVideo, restoreVideo } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRemoved = searchParams.get('includeRemoved') === 'true';
    const videos = await getVideos(includeRemoved);
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { videoId, action } = body;

    if (!videoId || !action) {
      return NextResponse.json(
        { error: 'Missing videoId or action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'setFeatured':
        await setVideoFeatured(videoId, true);
        return NextResponse.json({ 
          success: true,
          message: 'Video set as featured' 
        });
      case 'unsetFeatured':
        await setVideoFeatured(videoId, false);
        return NextResponse.json({ 
          success: true,
          message: 'Video unfeatured' 
        });
      case 'remove':
        await removeVideo(videoId);
        return NextResponse.json({ 
          success: true,
          message: 'Video removed' 
        });
      case 'restore':
        await restoreVideo(videoId);
        return NextResponse.json({ 
          success: true,
          message: 'Video restored' 
        });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    // If videoId is provided, delete that specific video
    if (videoId) {
      await removeVideo(videoId);
      return NextResponse.json({ 
        success: true,
        message: 'Video removed successfully' 
      });
    }

    // Otherwise, clear all videos (legacy behavior)
    await saveVideos([]);
    return NextResponse.json({ 
      success: true,
      message: 'All videos cleared successfully' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to clear videos' },
      { status: 500 }
    );
  }
}
