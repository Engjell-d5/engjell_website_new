import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Setting up database...\n');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✓ Created data directory');
}

// Generate Prisma Client
console.log('Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✓ Prisma Client generated\n');
} catch (error) {
  console.error('✗ Failed to generate Prisma Client');
  process.exit(1);
}

// Run migrations
console.log('Running database migrations...');
try {
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✓ Database migrations completed\n');
} catch (error) {
  console.error('✗ Failed to run migrations');
  process.exit(1);
}

// Migrate data from JSON files
console.log('Migrating data from JSON files...');
try {
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✓ Data migration completed\n');
} catch (error) {
  console.error('✗ Failed to migrate data');
  process.exit(1);
}

console.log('✅ Database setup complete!');
console.log('\nYour database is ready at: prisma/data/database.db');
