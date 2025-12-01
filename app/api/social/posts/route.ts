import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.socialPost.findMany({
      orderBy: { scheduledFor: 'desc' },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, mediaAssets, platforms, scheduledFor, status } = body;

    if (!content || !scheduledFor) {
      return NextResponse.json(
        { error: 'Missing required fields: content and scheduledFor are required' },
        { status: 400 }
      );
    }

    // Parse platforms - handle both string (JSON) and array formats
    let platformsArray: string[] = [];
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
    if (!platformsArray || platformsArray.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Handle mediaAssets
    const mediaAssetsJson = mediaAssets
      ? (typeof mediaAssets === 'string' ? mediaAssets : JSON.stringify(mediaAssets))
      : null;

    const post = await prisma.socialPost.create({
      data: {
        content,
        mediaAssets: mediaAssetsJson,
        platforms: JSON.stringify(platformsArray),
        scheduledFor: scheduledDate,
        status: status || 'scheduled',
        createdBy: user.id,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating social post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
