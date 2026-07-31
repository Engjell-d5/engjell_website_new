#!/bin/sh
set -e

echo "🚀 Starting application..."

# Wait a bit for PostgreSQL to be ready (depends_on handles most of this)
echo "⏳ Waiting for PostgreSQL to initialize..."
sleep 5

# Use the CLI baked into the image, at the version this schema was generated
# with. Do NOT use `npx prisma`: with no local copy it downloads the latest
# release, and a major-version mismatch fails every migration.
PRISMA="node /app/node_modules/prisma/build/index.js"

echo "📊 Running database migrations..."

if $PRISMA migrate deploy; then
  echo "✅ Migrations applied successfully"
else
  # Migrations CANNOT currently run: prisma/migrations/migration_lock.toml
  # records provider "sqlite" while the schema is "postgresql" (Prisma P3019),
  # left over from the SQLite era (see scripts/migrate-sqlite-to-postgres.ts).
  # The Postgres database is already in the correct shape and is maintained
  # out of band, so the 17 legacy migrations must NOT be replayed against it.
  #
  # Starting anyway is the right call here, but it is NOT success: a previous
  # version of this script printed "Migrations complete" over this failure,
  # which is how it went unnoticed. Fail loudly, keep serving.
  echo ""
  echo "############################################################"
  echo "# ⚠️  MIGRATIONS DID NOT RUN. Starting the app regardless.  #"
  echo "#                                                          #"
  echo "# Known cause: migration_lock.toml says sqlite, schema     #"
  echo "# says postgresql (P3019). The schema history needs to be  #"
  echo "# rebaselined for Postgres before migrations work again.   #"
  echo "#                                                          #"
  echo "# Until then any new migration will NOT be applied.        #"
  echo "############################################################"
  echo ""
fi

# Execute the main command
exec "$@"
