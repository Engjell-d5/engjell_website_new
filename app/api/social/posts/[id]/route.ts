import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.socialPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching social post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, mediaAssets, platforms, scheduledFor } = body;

    const existingPost = await prisma.socialPost.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Allow editing published posts so they can be edited and reposted
    // Note: Editing a published post will reset its status to 'scheduled' if scheduledFor is updated

    // Parse platforms - handle both string (JSON) and array formats
    let platformsArray: string[] = [];
    if (platforms !== undefined) {
      if (typeof platforms === 'string') {
        try {
          platformsArray = JSON.parse(platforms);
        } catch (e) {
          console.error('[POSTS-API] Error parsing platforms string:', e);
          return NextResponse.json(
            { error: 'Invalid platforms format' },
            { status: 400 }
          );
        }
      } else if (Array.isArray(platforms)) {
        platformsArray = platforms;
      } else {
        return NextResponse.json(
          { error: 'Platforms must be an array or JSON string' },
          { status: 400 }
        );
      }

      // Validate platforms - must be an array with at least one platform
      if (platformsArray.length === 0) {
        return NextResponse.json(
          { error: 'At least one platform must be selected' },
          { status: 400 }
        );
      }
    }

    // Handle mediaAssets
    const mediaAssetsJson = mediaAssets
      ? (typeof mediaAssets === 'string' ? mediaAssets : JSON.stringify(mediaAssets))
      : existingPost.mediaAssets;

    const updateData: any = {
      content,
      mediaAssets: mediaAssetsJson,
    };

    // Only update platforms if they were provided
    if (platforms !== undefined) {
      updateData.platforms = JSON.stringify(platformsArray);
    }

    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      const now = new Date();
      
      // Only validate if the date is in the past (with a small buffer for clock differences)
      // Allow updating to a time just slightly in the past to handle timezone/rounding issues
      if (scheduledDate.getTime() < now.getTime() - 60000) { // 1 minute buffer
        return NextResponse.json(
          { error: 'Scheduled date must be in the future' },
          { status: 400 }
        );
      }
      updateData.scheduledFor = scheduledDate;
      // Reset status to scheduled so the post can be reposted
      // This applies to both published and scheduled posts
      updateData.status = 'scheduled';
    }
    
    // If content or mediaAssets are updated on a published post, reset status to scheduled so it can be reposted
    if (existingPost.status === 'published' && (content || mediaAssets !== undefined)) {
      updateData.status = 'scheduled';
    }

    const post = await prisma.socialPost.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating social post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to update post',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.socialPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.socialPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
