import { NextRequest, NextResponse } from 'next/server';

/**
 * Retired by the d5 cutover: this site no longer runs a YouTube fetch
 * cron. d5 syncs every tenant channel nightly at 03:00 and on demand.
 */
const gone = () =>
  NextResponse.json(
    { error: 'The YouTube cron moved to d5: it syncs nightly, with Refresh now in Settings -> Companies -> YouTube.' },
    { status: 410 },
  );

export async function GET(_request: NextRequest) {
  return gone();
}

export async function POST(_request: NextRequest) {
  return gone();
}
