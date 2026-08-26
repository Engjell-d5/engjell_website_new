import { NextRequest, NextResponse } from 'next/server';

/**
 * Retired by the d5 cutover: the YouTube API key and fetch schedule this
 * managed no longer exist on this site. d5 holds the key and runs the
 * nightly sync for every tenant channel.
 */
const gone = () =>
  NextResponse.json(
    { error: 'YouTube configuration moved to d5 (app.division5.co): Settings -> Companies -> YouTube.' },
    { status: 410 },
  );

export async function GET(_request: NextRequest) {
  return gone();
}

export async function PUT(_request: NextRequest) {
  return gone();
}
