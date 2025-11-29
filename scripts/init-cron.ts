import { startYouTubeCron } from '../lib/cron';

// Initialize cron job
console.log('Initializing YouTube video fetch cron job...');
startYouTubeCron();
console.log('Cron job initialized. Server will continue running...');

// Keep process alive
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

