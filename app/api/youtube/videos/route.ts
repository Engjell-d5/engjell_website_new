import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getVideos, saveVideos } from '@/lib/data';

export async function GET() {
  try {
    const videos = await getVideos();
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
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
    await saveVideos([]);
    return NextResponse.json({ 
      success: true,
      message: 'All videos cleared successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear videos' },
      { status: 500 }
    );
  }
}
