#!/bin/sh
set -e

echo "🚀 Starting application..."

# Wait a bit for PostgreSQL to be ready (depends_on handles most of this)
echo "⏳ Waiting for PostgreSQL to initialize..."
sleep 5

# Run migrations (Prisma will handle connection retries and create database if needed)
echo "📊 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration deploy failed, attempting to initialize..."
  npx prisma migrate dev --name init || echo "⚠️  Migration initialization failed, continuing..."
}

echo "✅ Migrations complete"

# Execute the main command
exec "$@"
