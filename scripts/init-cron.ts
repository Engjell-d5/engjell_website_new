// Retired by the d5 cutover. This script existed to start the site's
// YouTube fetch cron; that fetcher now lives in d5, which syncs every
// tenant channel nightly. Kept as a harmless no-op so anything that still
// invokes the script (a leftover process manager entry, a habit) exits
// cleanly instead of crashing.
console.log('init-cron: nothing to start; the YouTube fetch moved to d5 (app.division5.co).');
process.exit(0);
