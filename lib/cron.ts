import 'server-only';
import cron from 'node-cron';
import { fetchYouTubeVideos } from './youtube';
import { getConfig } from './data';
import { publishScheduledPosts } from './social';

let cronJob: cron.ScheduledTask | null = null;
let socialCronJob: cron.ScheduledTask | null = null;
let initialized = false;
let socialInitialized = false;

export async function startYouTubeCron() {
  // Prevent multiple initializations
  if (initialized && cronJob) {
    return cronJob;
  }

  const config = await getConfig();
  const schedule = config.cronSchedule || '0 2 * * *'; // Default: 2 AM daily

  // Stop existing job if any
  if (cronJob) {
    cronJob.stop();
  }

  console.log(`Starting YouTube video fetch cron job with schedule: ${schedule}`);

  cronJob = cron.schedule(schedule, async () => {
    console.log('Running YouTube video fetch cron job...');
    try {
      await fetchYouTubeVideos();
      console.log('YouTube videos fetched successfully');
    } catch (error) {
      console.error('Error in YouTube video fetch cron job:', error);
    }
  });

  initialized = true;
  return cronJob;
}

export function stopYouTubeCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('YouTube video fetch cron job stopped');
  }
}

export async function restartYouTubeCron() {
  stopYouTubeCron();
  return await startYouTubeCron();
}

export async function startSocialMediaCron() {
  console.log(`[CRON-INIT] startSocialMediaCron called - initialized: ${socialInitialized}, hasJob: ${!!socialCronJob}`);
  
  // Prevent multiple initializations
  if (socialInitialized && socialCronJob) {
    console.log(`[CRON-INIT] Social media cron already initialized, returning existing job`);
    return socialCronJob;
  }

  // Run every 5 minutes to check for scheduled posts
  const schedule = '*/5 * * * *';

  // Stop existing job if any
  if (socialCronJob) {
    console.log(`[CRON-INIT] Stopping existing social media cron job`);
    socialCronJob.stop();
    socialCronJob = null;
  }

  console.log(`[CRON-INIT] Starting social media publishing cron job with schedule: ${schedule}`);
  console.log(`[CRON-INIT] Current time: ${new Date().toISOString()}`);

  socialCronJob = cron.schedule(schedule, async () => {
    const runTime = new Date().toISOString();
    console.log(`[CRON] ============================================`);
    console.log(`[CRON] Running social media publishing cron job at ${runTime}`);
    console.log(`[CRON] ============================================`);
    try {
      const result = await publishScheduledPosts();
      console.log(`[CRON] Social media cron complete - published: ${result.published}, failed: ${result.failed}, total: ${result.total}`);
      if (result.published > 0) {
        console.log(`[CRON] ✓ Published ${result.published} social media post(s)`);
      } else {
        console.log(`[CRON] No posts were published this run`);
      }
    } catch (error) {
      console.error('[CRON] Error in social media publishing cron job:', error);
      if (error instanceof Error) {
        console.error('[CRON] Error details:', error.message, error.stack);
      }
    }
    console.log(`[CRON] ============================================`);
  });

  // Verify the job was created
  if (socialCronJob) {
    console.log(`[CRON-INIT] ✓ Social media cron job created successfully`);
    console.log(`[CRON-INIT] Next run will be at the next 5-minute mark`);
    
    // Calculate and log next run time
    const now = new Date();
    const minutes = now.getMinutes();
    const nextMinutes = Math.ceil((minutes + 1) / 5) * 5;
    const nextRun = new Date(now);
    nextRun.setMinutes(nextMinutes);
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
    if (nextMinutes >= 60) {
      nextRun.setHours(nextRun.getHours() + 1);
      nextRun.setMinutes(0);
    }
    console.log(`[CRON-INIT] Next scheduled run: ${nextRun.toISOString()}`);
  } else {
    console.error(`[CRON-INIT] ✗ Failed to create social media cron job`);
  }

  socialInitialized = true;
  return socialCronJob;
}

export function stopSocialMediaCron() {
  if (socialCronJob) {
    socialCronJob.stop();
    socialCronJob = null;
    console.log('Social media publishing cron job stopped');
  }
}

export async function restartSocialMediaCron() {
  stopSocialMediaCron();
  return await startSocialMediaCron();
}

export async function initializeAllCronJobs() {
  console.log(`[CRON-INIT] ============================================`);
  console.log(`[CRON-INIT] Initializing all cron jobs at ${new Date().toISOString()}`);
  console.log(`[CRON-INIT] ============================================`);
  try {
    await startYouTubeCron();
    console.log(`[CRON-INIT] YouTube cron initialized`);
  } catch (error) {
    console.error(`[CRON-INIT] Failed to initialize YouTube cron:`, error);
  }
  
  try {
    await startSocialMediaCron();
    console.log(`[CRON-INIT] Social media cron initialized`);
  } catch (error) {
    console.error(`[CRON-INIT] Failed to initialize social media cron:`, error);
  }
  console.log(`[CRON-INIT] ============================================`);
}

export function getCronStatus() {
  return {
    youtube: {
      initialized,
      running: initialized && cronJob !== null,
    },
    socialMedia: {
      initialized: socialInitialized,
      running: socialInitialized && socialCronJob !== null,
    },
  };
}

/**
 * Calculate next run time for a cron schedule
 */
export function getNextRunTime(schedule: string): Date | null {
  try {
    const now = new Date();
    let nextRun = new Date(now);

    // Parse cron format: minute hour day month dayOfWeek
    // Examples:
    // "*/5 * * * *" - Every 5 minutes
    // "0 2 * * *" - Daily at 2 AM
    
    const parts = schedule.trim().split(/\s+/);
    if (parts.length !== 5) return null;

    const [minute, hour, day, month, dayOfWeek] = parts;

    // Handle "*/5 * * * *" pattern (every 5 minutes)
    if (minute.startsWith('*/')) {
      const interval = parseInt(minute.substring(2));
      if (!isNaN(interval) && interval > 0) {
        // Calculate next run time: round up to next interval
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        
        // If we're at exactly an interval mark and no seconds have passed, move to next
        const remainder = currentMinutes % interval;
        let minutesToAdd = interval - remainder;
        
        // If we're already at an interval mark, move to next one
        if (remainder === 0 && currentSeconds === 0) {
          minutesToAdd = interval;
        }
        
        nextRun = new Date(now);
        nextRun.setMinutes(currentMinutes + minutesToAdd);
        nextRun.setSeconds(0);
        nextRun.setMilliseconds(0);
        
        // If we've passed the hour, it will automatically roll over
        if (currentMinutes + minutesToAdd >= 60) {
          nextRun.setHours(now.getHours() + 1);
          nextRun.setMinutes((currentMinutes + minutesToAdd) % 60);
        }
        
        return nextRun;
      }
    }

    // Handle daily schedule like "0 2 * * *" (daily at 2 AM)
    if (minute === '0' && hour !== '*' && day === '*' && month === '*' && dayOfWeek === '*') {
      const targetHour = parseInt(hour);
      if (!isNaN(targetHour)) {
        nextRun = new Date(now);
        nextRun.setHours(targetHour);
        nextRun.setMinutes(0);
        nextRun.setSeconds(0);
        nextRun.setMilliseconds(0);
        
        // If we've passed today's target time, move to tomorrow
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        
        return nextRun;
      }
    }

    return null;
  } catch (error) {
    console.error('Error calculating next run time:', error);
    return null;
  }
}

export async function getCronStatusWithNextRun() {
  const status = getCronStatus();
  const config = await getConfig();
  const youtubeSchedule = config.cronSchedule || '0 2 * * *';
  const socialMediaSchedule = '*/5 * * * *';

  const youtubeNextRun = status.youtube.running ? getNextRunTime(youtubeSchedule) : null;
  const socialNextRun = status.socialMedia.running ? getNextRunTime(socialMediaSchedule) : null;

  return {
    youtube: {
      ...status.youtube,
      nextRun: youtubeNextRun ? youtubeNextRun.toISOString() : null,
      schedule: youtubeSchedule,
    },
    socialMedia: {
      ...status.socialMedia,
      nextRun: socialNextRun ? socialNextRun.toISOString() : null,
      schedule: socialMediaSchedule,
    },
  };
}

