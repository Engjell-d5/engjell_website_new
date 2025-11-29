# Database Migration Guide

Your application has been migrated from JSON files to SQLite database using Prisma.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variable:**
   Create a `.env` file in the root directory (or update existing one) with:
   ```
   DATABASE_URL="file:./data/database.db"
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```
   This will create the database file and all tables.

5. **Migrate existing JSON data to database:**
   ```bash
   npm run db:seed
   ```
   This will copy all your existing data from JSON files to the database.

## What Changed

- **Database**: SQLite (file-based, no server needed)
- **ORM**: Prisma (type-safe database access)
- **Location**: Database file at `data/database.db`
- **API**: All data functions are now async (use `await`)

## Benefits

✅ **Production-ready**: Handles concurrent requests safely
✅ **Better performance**: Indexed queries, efficient data access
✅ **Data integrity**: ACID transactions, no corruption risk
✅ **Type safety**: Prisma generates TypeScript types
✅ **Scalable**: Easy to upgrade to PostgreSQL later

## Upgrading to PostgreSQL (Optional)

If you want to use PostgreSQL in production:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Backup

The database file is at `data/database.db`. Make sure to back it up regularly in production.

## Notes

- Your JSON files are still in the `data/` directory
- You can delete them after verifying the migration worked
- The database file is gitignored (won't be committed)
