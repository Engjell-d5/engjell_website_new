# Migration Guide: SQLite to PostgreSQL with Docker

This guide will help you migrate from the current SQLite setup to PostgreSQL using Docker.

## Overview

**Current Setup:**
- SQLite database (`data/database.db`)
- PM2 process manager
- Direct server deployment

**New Setup:**
- PostgreSQL database (Docker container)
- Docker Compose orchestration
- Containerized Next.js application

## Pre-Migration Checklist

- [ ] Backup your current SQLite database
- [ ] Backup your `public/uploads` directory
- [ ] Note down all environment variables
- [ ] Ensure Docker is installed on your server

## Step 1: Backup Current Data

### Backup SQLite Database
```bash
# On your current server
cd /var/www/engjell-website
cp data/database.db data/database.db.backup
```

### Backup Uploads
```bash
# Backup uploaded files
tar -czf uploads-backup.tar.gz public/uploads/
```

### Export Data (Optional - for manual migration)
```bash
# Export users
sqlite3 data/database.db ".dump users" > users-backup.sql

# Export blogs
sqlite3 data/database.db ".dump blogs" > blogs-backup.sql

# Export all data
sqlite3 data/database.db ".dump" > full-backup.sql
```

## Step 2: Prepare Docker Environment

### On Your Server

1. **Install Docker** (if not already installed):
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo apt-get install docker-compose-plugin
   ```

2. **Clone/Update Repository**:
   ```bash
   cd /var/www
   git pull  # or clone fresh
   cd engjell-website
   ```

3. **Create Environment File**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your settings
   ```

   **Important settings in `.env`:**
   ```env
   POSTGRES_PASSWORD=your-secure-password-here
   JWT_SECRET=your-jwt-secret-here
   DATABASE_URL=postgresql://engjell:your-secure-password-here@postgres:5432/engjell_website?schema=public
   ```

## Step 3: Start Docker Services

```bash
# Build and start containers
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Step 4: Run Migrations

```bash
# Run Prisma migrations (creates tables)
docker-compose exec app npx prisma migrate deploy

# Verify database connection
docker-compose exec app npx prisma db pull
```

## Step 5: Migrate Data

### Option A: Automated Migration Script (Recommended) ⭐

We have a dedicated script that migrates all data from SQLite to PostgreSQL:

1. **Ensure SQLite database exists**:
   ```bash
   # On your server, make sure data/database.db exists
   ls -la data/database.db
   ```

2. **Set PostgreSQL DATABASE_URL**:
   ```bash
   # In your .env file, ensure DATABASE_URL points to PostgreSQL
   DATABASE_URL=postgresql://engjell:your-password@postgres:5432/engjell_website?schema=public
   ```

3. **Run the migration script**:
   
   **Option A: Run from host machine (Recommended)**
   
   ```bash
   # IMPORTANT: Run from the HOST machine (on your server), NOT inside Docker
   # The Docker container doesn't have tsx and better-sqlite3 (dev dependencies)
   
   # Step 1: Temporarily expose PostgreSQL port (if not already exposed)
   # Edit docker-compose.yml and uncomment the ports section:
   # ports:
   #   - "${POSTGRES_PORT:-5433}:5432"
   # Then restart: docker compose up -d
   
   # Step 2: On your server, navigate to the project directory
   cd /var/www/engjell-website
   
   # Step 3: Ensure dependencies are installed (including dev dependencies)
   npm install
   
   # Step 4: Set DATABASE_URL in .env to point to PostgreSQL (accessible from host)
   # DATABASE_URL=postgresql://engjell:your-password@localhost:5433/engjell_website?schema=public
   # Note: Use 5433 if that's your POSTGRES_PORT, or 5432 if using default
   
   # Step 5: Ensure SQLite database exists
   ls -la data/database.db
   
   # Step 6: Run the migration script
   npm run migrate:sqlite-to-postgres
   ```
   
   **Option B: Run using a temporary container with all dependencies**
   
   ```bash
   # Create a temporary container with all dependencies for migration
   docker compose run --rm -v $(pwd)/data:/app/data -v $(pwd)/scripts:/app/scripts \
     -e DATABASE_URL="postgresql://engjell:changeme@postgres:5432/engjell_website?schema=public" \
     app sh -c "npm install tsx better-sqlite3 @types/better-sqlite3 --save-dev && npm run migrate:sqlite-to-postgres"
   ```

   The script will:
   - ✅ Read all data from SQLite
   - ✅ Convert data types (booleans, dates, etc.)
   - ✅ Migrate all tables (users, blogs, videos, subscribers, etc.)
   - ✅ Handle relationships and foreign keys
   - ✅ Use upsert to avoid duplicates

### Option B: Use Prisma Migrate + JSON Seed

If your data is in JSON files:

1. **Create initial admin user**:
   ```bash
   docker-compose exec app npm run init-admin
   ```

2. **Re-import data from JSON files**:
   ```bash
   # If you have data in JSON files
   docker-compose exec app npm run db:seed
   ```

### Option C: Manual SQL Migration

If you exported SQL from SQLite:

```bash
# Convert SQLite SQL to PostgreSQL format (manual editing required)
# Then import:
docker-compose exec -T postgres psql -U engjell -d engjell_website < converted-backup.sql
```

**Note:** SQLite and PostgreSQL have syntax differences. You may need to:
- Convert `INTEGER PRIMARY KEY` to `SERIAL PRIMARY KEY`
- Handle `TEXT` types differently
- Convert datetime formats
- Handle boolean values (SQLite uses 0/1, PostgreSQL uses true/false)

## Step 6: Verify Migration

```bash
# Check database tables
docker compose exec postgres psql -U engjell -d engjell_website -c "\dt"

# Check record counts
docker compose exec postgres psql -U engjell -d engjell_website -c "SELECT COUNT(*) FROM users;"
docker compose exec postgres psql -U engjell -d engjell_website -c "SELECT COUNT(*) FROM blogs;"

# Test application
curl http://localhost:3000
```

## Step 7: Update Deployment

### Stop Old PM2 Process
```bash
pm2 delete engjell-website
pm2 save
```

### Update Nginx Configuration

The nginx configuration in `docker-compose.yml` handles this automatically if you use the nginx service. Otherwise, update your existing nginx config to point to `localhost:3000` (Docker app port).

## Step 8: Cleanup (After Verification)

Once everything is working:

```bash
# Remove old SQLite database (keep backup!)
mv data/database.db data/database.db.old

# Remove old PM2 ecosystem
# (already done if you stopped PM2)
```

## Rollback Plan

If something goes wrong:

1. **Stop Docker containers**:
   ```bash
   docker-compose down
   ```

2. **Restore SQLite**:
   ```bash
   cp data/database.db.backup data/database.db
   ```

3. **Restart PM2**:
   ```bash
   PORT=7776 pm2 start ecosystem.config.js --only engjell-website
   ```

4. **Revert Prisma schema** (if needed):
   ```bash
   git checkout prisma/schema.prisma
   ```

## Troubleshooting

### Database Connection Errors

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U engjell -d engjell_website

# Verify DATABASE_URL in .env matches docker-compose.yml
```

### Migration Errors

```bash
# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d postgres
docker-compose exec app npx prisma migrate reset

# Or manually drop and recreate
docker-compose exec postgres psql -U engjell -c "DROP DATABASE engjell_website;"
docker-compose exec postgres psql -U engjell -c "CREATE DATABASE engjell_website;"
```

### Application Won't Start

```bash
# Check application logs
docker-compose logs app

# Rebuild containers
docker-compose build --no-cache app
docker-compose up -d app
```

## Post-Migration Tasks

- [ ] Update backup scripts to use PostgreSQL
- [ ] Set up automated PostgreSQL backups
- [ ] Update monitoring/alerting for Docker containers
- [ ] Document new deployment process
- [ ] Test all admin panel features
- [ ] Verify email functionality
- [ ] Test social media integrations

## Backup Strategy (Post-Migration)

### Daily Backups
```bash
#!/bin/bash
# Add to crontab: 0 2 * * * /path/to/backup.sh

BACKUP_DIR="/backups/engjell-website"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U engjell engjell_website | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz public/uploads/

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

## Next Steps

After successful migration:
1. Monitor application for 24-48 hours
2. Set up automated backups
3. Consider setting up Docker Swarm or Kubernetes for production
4. Configure SSL/TLS certificates
5. Set up monitoring (Prometheus, Grafana, etc.)

