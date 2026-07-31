#!/bin/sh
set -e

echo "🚀 Starting application..."

# Wait a bit for PostgreSQL to be ready (depends_on handles most of this)
echo "⏳ Waiting for PostgreSQL to initialize..."
sleep 5

# Run migrations using the CLI baked into the image, at the exact version this
# schema was generated with. Do NOT use `npx prisma` here: with no local copy
# it silently downloads the latest release, and a major-version mismatch makes
# every migration fail with a schema validation error.
#
# The previous version also fell back to `prisma migrate dev`, which is a
# development command that can reset the database. It never ran successfully
# here, but it had no business being on a production start path.
PRISMA="node /app/node_modules/prisma/build/index.js"

echo "📊 Running database migrations..."

# Postgres can still refuse connections for a few seconds after its port opens,
# so retry a handful of times before giving up.
attempt=1
max_attempts=5
until $PRISMA migrate deploy; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo ""
    echo "❌ Migrations failed after ${max_attempts} attempts. Refusing to start."
    echo "   Serving traffic against an unmigrated schema is worse than being"
    echo "   down: the app would run, look healthy, and read the wrong columns."
    echo "   Fix the error above, then redeploy."
    exit 1
  fi
  echo "⚠️  Migration attempt ${attempt}/${max_attempts} failed, retrying in 5s..."
  attempt=$((attempt + 1))
  sleep 5
done

echo "✅ Migrations applied successfully"

# Execute the main command
exec "$@"
