import { NextResponse } from 'next/server';
import { startYouTubeCron } from '@/lib/cron';

// Initialize cron job on first request
let initialized = false;

export async function GET() {
  if (!initialized) {
    startYouTubeCron();
    initialized = true;
    return NextResponse.json({ message: 'Cron job initialized' });
  }
  return NextResponse.json({ message: 'Cron job already initialized' });
}

