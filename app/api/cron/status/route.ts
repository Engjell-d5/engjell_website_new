import { NextResponse } from 'next/server';
import { getCronStatusWithNextRun, initializeAllCronJobs } from '@/lib/cron';

export const dynamic = 'force-dynamic';

/**
 * Two crons remain on this site: social publishing and the email job.
 * The YouTube fetch and the subscriber sync moved to d5, which owns the
 * channel cache and the newsletter audience.
 */
export async function GET() {
  let status = await getCronStatusWithNextRun();

  // If cron jobs aren't running, try to initialize them
  if (!status.socialMedia.running) {
    try {
      await initializeAllCronJobs();
      status = await getCronStatusWithNextRun();
    } catch (error) {
      console.error('Error initializing cron jobs:', error);
    }
  }

  return NextResponse.json({
    cronJobs: status,
    schedule: {
      socialMedia: 'Runs every 5 minutes to check for scheduled posts (*/5 * * * *)',
      email: 'Runs on the schedule configured for the email job',
    },
    endpoints: {
      init: '/api/cron/init - Initialize all cron jobs',
      publish: '/api/social/publish - Manually trigger post publishing',
      status: '/api/cron/status - Check cron job status',
    },
    movedToD5: {
      youtube: 'd5 syncs every tenant channel nightly and on demand',
      subscriberSync: 'd5 owns the newsletter audience and pushes to the ESP itself',
    },
    note: status.socialMedia.running
      ? 'Social media cron job is running and will check for scheduled posts every 5 minutes'
      : 'Social media cron job is not running. Call /api/cron/init to start it.',
    warning:
      'Note: In serverless environments, cron jobs are per-instance. They need to be initialized on each server instance.',
  });
}
