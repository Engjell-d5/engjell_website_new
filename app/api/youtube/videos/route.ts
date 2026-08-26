import { NextRequest, NextResponse } from 'next/server';
import { getVideos } from '@/lib/data';

/**
 * Read-only since the d5 cutover: the list this serves comes from d5's
 * cached feed. Curation (feature, hide) and refresh happen in d5 under
 * Settings -> Companies -> YouTube, so the write verbs answer 410 with
 * that pointer instead of silently editing a table nothing reads.
 */
export async function GET() {
  try {
    const videos = await getVideos();
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

const gone = () =>
  NextResponse.json(
    { error: 'Video curation moved to d5 (app.division5.co): Settings -> Companies -> YouTube.' },
    { status: 410 },
  );

export async function PATCH(_request: NextRequest) {
  return gone();
}

export async function DELETE(_request: NextRequest) {
  return gone();
}
