import { startYouTubeCron } from '../lib/cron';

// Initialize cron job
async function init() {
console.log('Initializing YouTube video fetch cron job...');
  await startYouTubeCron();
console.log('Cron job initialized. Server will continue running...');
}

init().catch(console.error);

// Keep process alive
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

