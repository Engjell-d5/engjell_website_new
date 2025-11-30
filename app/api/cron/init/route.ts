import { NextResponse } from 'next/server';
import { initializeAllCronJobs, getCronStatus } from '@/lib/cron';

export async function GET() {
  console.log(`[CRON-API] /api/cron/init called at ${new Date().toISOString()}`);
  try {
    await initializeAllCronJobs();
    const status = getCronStatus();
    
    console.log(`[CRON-API] Cron initialization complete, status:`, JSON.stringify(status, null, 2));
    
    return NextResponse.json({ 
      message: 'All cron jobs initialized',
      status,
      note: 'In serverless environments, cron jobs need to be initialized on each server instance. They will not persist across cold starts.',
    });
  } catch (error) {
    console.error('[CRON-API] Error initializing cron jobs:', error);
    if (error instanceof Error) {
      console.error('[CRON-API] Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to initialize cron jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

