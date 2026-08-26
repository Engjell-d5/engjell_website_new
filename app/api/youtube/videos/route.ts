import { NextResponse } from 'next/server';
import { getVideos } from '@/lib/data';

/**
 * Episodes for the public sidebar's "Latest Video".
 *
 * The data comes from d5, which owns the channel connection, the sync and
 * the curation. This endpoint exists only because the sidebar is a client
 * component and needs something to call; the write verbs went with the
 * admin panel.
 */
export async function GET() {
  try {
    const videos = await getVideos();
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
