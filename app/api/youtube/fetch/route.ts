import { NextRequest, NextResponse } from 'next/server';

/**
 * Retired by the d5 cutover: this site no longer fetches from YouTube.
 * d5 syncs the channel nightly and on demand (Settings -> Companies ->
 * YouTube -> Refresh now); this site reads d5's cache.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Fetching moved to d5 (app.division5.co): the channel syncs nightly, or use Refresh now in Settings -> Companies -> YouTube.',
    },
    { status: 410 },
  );
}
