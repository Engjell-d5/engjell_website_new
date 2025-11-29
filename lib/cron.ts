import 'server-only';
import cron from 'node-cron';
import { fetchYouTubeVideos } from './youtube';
import { getConfig } from './data';

let cronJob: cron.ScheduledTask | null = null;
let initialized = false;

export function startYouTubeCron() {
  // Prevent multiple initializations
  if (initialized && cronJob) {
    return cronJob;
  }

  const config = getConfig();
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

export function restartYouTubeCron() {
  stopYouTubeCron();
  return startYouTubeCron();
}

