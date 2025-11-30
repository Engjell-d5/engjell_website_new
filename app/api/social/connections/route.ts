import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connections = await prisma.socialConnection.findMany({
      select: {
        id: true,
        platform: true,
        isActive: true,
        username: true,
        profileImage: true,
        connectedAt: true,
      },
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching social connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform parameter is required' },
        { status: 400 }
      );
    }

    // Delete the connection for the specified platform
    const result = await prisma.socialConnection.deleteMany({
      where: {
        platform: platform.toLowerCase(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Disconnected ${platform} account successfully`,
    });
  } catch (error) {
    console.error('Error disconnecting social account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
