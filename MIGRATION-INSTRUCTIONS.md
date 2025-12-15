# Running SQLite to PostgreSQL Migration

## The Problem
The migration script requires `tsx` and `better-sqlite3` which are dev dependencies. The Docker container uses Next.js standalone output and doesn't include dev dependencies.

Also, when running from the host machine, you need to use `localhost:5434` (or whatever port is set in POSTGRES_PORT) instead of `postgres:5432` in the DATABASE_URL.

## Solution: Run from Host Machine

### Step 1: Expose PostgreSQL Port

The `docker-compose.yml` should already have the port exposed (default is 5434 to avoid conflicts). If not, uncomment:
```yaml
ports:
  - "${POSTGRES_PORT:-5434}:5432"
```

Then restart:
```bash
docker compose up -d
```

### Step 2: Update DATABASE_URL for Host Access

**IMPORTANT**: If your password contains special characters (`@`, `!`, `#`, `$`, etc.), they MUST be URL-encoded!

On your server:

```bash
cd /var/www/engjell-website

# Option A: Use the helper script (recommended)
bash scripts/fix-db-url.sh

# Option B: Manual fix
# Get password and URL-encode it
PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"')
# URL-encode using Python (if available)
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD', safe=''))" 2>/dev/null || \
  echo -n "$PASSWORD" | sed 's/@/%40/g; s/!/%21/g; s/#/%23/g; s/\$/%24/g')

# Backup and update .env
cp .env .env.backup
sed -i '/^DATABASE_URL=.*file:.*database\.db/d' .env
sed -i '/^DATABASE_URL=postgresql:\/\/.*@postgres:5432/d' .env
sed -i '/^DATABASE_URL=postgresql:\/\/.*@localhost:5434/d' .env
echo "DATABASE_URL=postgresql://engjell:${ENCODED_PASSWORD}@localhost:5434/engjell_website?schema=public" >> .env

# Verify the change
grep "^DATABASE_URL=postgresql://" .env
```

**Common URL encodings:**
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`

### Step 2.5: Fix PostgreSQL Password (If Authentication Fails)

If you get authentication errors, PostgreSQL was likely initialized with a different password. Since you're migrating from SQLite, the easiest solution is to recreate the database:

```bash
cd /var/www/engjell-website

# Option 1: Recreate database volume (RECOMMENDED - Safe since migrating from SQLite)
# This will initialize PostgreSQL with the password from your current .env file

# First, stop any existing containers
docker compose down

# Note: If you see port conflicts, check what's using the port:
# docker ps | grep 5434
# The default port is now 5434 to avoid conflicts with other PostgreSQL instances

# Now recreate the database
docker compose down -v
docker compose up -d postgres

# Wait for PostgreSQL to initialize
echo "Waiting for PostgreSQL to initialize..."
sleep 10

# Verify it's ready
until docker compose exec postgres pg_isready -U engjell > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done

# Run migrations to create tables
# IMPORTANT: Run from HOST machine, not inside Docker (Prisma not available in standalone container)
# Make sure DATABASE_URL is set for host access first
bash scripts/fix-db-url.sh

# Since migrations were created for SQLite, we need to reset and create new ones for PostgreSQL
# Option 1: Reset migration history and create fresh migrations (RECOMMENDED)
rm -rf prisma/migrations
npx prisma migrate dev --name init

# Option 2: If you want to keep migration history, use db push instead
# npx prisma db push

echo "✅ Database recreated with correct password"
```

**Note**: If you already have data in PostgreSQL that you want to keep, you can try to reset the password by connecting with the old password first, but since you're migrating from SQLite, recreating is simpler.

### Step 3: Run Migration on Host

```bash
# Install dependencies (including dev dependencies)
npm install

# Ensure SQLite database exists
ls -la data/database.db

# Run migration
npm run migrate:sqlite-to-postgres
```

### Step 4: Restore DATABASE_URL (Important!)

After migration, restore the original DATABASE_URL for Docker:

```bash
# Restore original .env
cp .env.backup .env

# Or manually change back (update port if you changed POSTGRES_PORT):
sed -i 's/@localhost:5434/@postgres:5432/g' .env
```

### Step 5: Hide PostgreSQL Port Again (Optional)

After migration, you can comment out the port again in `docker-compose.yml` for security, but keep it if you need external access for backups, etc.

## Alternative: Use Temporary Container

If you prefer to run inside Docker:

```bash
# Run a temporary container with all dependencies
docker compose run --rm \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/scripts:/app/scripts \
  -e DATABASE_URL="postgresql://engjell:changeme@postgres:5432/engjell_website?schema=public" \
  app sh -c "npm install tsx better-sqlite3 @types/better-sqlite3 --save-dev && npm run migrate:sqlite-to-postgres"
```

Note: This requires the `data` and `scripts` directories to be accessible to the container.

