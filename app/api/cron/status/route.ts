import { NextResponse } from 'next/server';
import { getCronStatusWithNextRun, initializeAllCronJobs } from '@/lib/cron';

export async function GET() {
  let status = await getCronStatusWithNextRun();
  
  // If cron jobs aren't running, try to initialize them
  if (!status.socialMedia.running || !status.youtube.running || !status.subscriberSync.running) {
    try {
      await initializeAllCronJobs();
      // Get updated status after initialization
      status = await getCronStatusWithNextRun();
    } catch (error) {
      console.error('Error initializing cron jobs:', error);
    }
  }
  
  return NextResponse.json({
    cronJobs: status,
    schedule: {
      youtube: 'Runs daily at 2 AM (configurable)',
      socialMedia: 'Runs every 5 minutes to check for scheduled posts (*/5 * * * *)',
      subscriberSync: 'Runs daily at 3 AM to sync subscribers with Sender.net (0 3 * * *)',
    },
    endpoints: {
      init: '/api/cron/init - Initialize all cron jobs',
      publish: '/api/social/publish - Manually trigger post publishing',
      sync: '/api/subscribers/sync - Manually trigger subscriber sync',
      status: '/api/cron/status - Check cron job status',
    },
    note: status.socialMedia.running 
      ? 'Social media cron job is running and will check for scheduled posts every 5 minutes'
      : 'Social media cron job is not running. Call /api/cron/init to start it.',
    warning: 'Note: In serverless environments, cron jobs are per-instance. They need to be initialized on each server instance.',
  });
}
