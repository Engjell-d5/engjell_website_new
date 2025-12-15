# Docker Setup Guide

This guide explains how to run the Engjell Rraklli website using Docker and PostgreSQL.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd new_engjell_website
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file** with your configuration:
   - Change `POSTGRES_PASSWORD` to a secure password
   - Change `JWT_SECRET` to a secure random string
   - Update other environment variables as needed

4. **Start the services**:
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

6. **Create admin user** (first time only):
   ```bash
   docker-compose exec app npm run init-admin
   ```

7. **Access the application**:
   - Website: http://localhost:7776 (default port, configurable via APP_PORT)
   - Admin Panel: http://localhost:7776/admin/login
   - With Nginx: http://localhost:8080

## Services

### PostgreSQL Database
- **Port**: 5432 (default)
- **Database**: `engjell_website` (configurable)
- **User**: `engjell` (configurable)
- **Data**: Persisted in Docker volume `postgres_data`

### Next.js Application
- **Port**: 7776 (default, configurable via APP_PORT)
- **Container**: `engjell-website-app`
- **Health**: Automatically runs migrations on startup

### Nginx (Optional)
- **Port**: 8080 (default)
- **Profile**: `production` (use `docker-compose --profile production up`)
- **Config**: `nginx.conf`

## Common Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes database)
```bash
docker-compose down -v
```

### Rebuild application
```bash
docker-compose build app
docker-compose up -d app
```

### Run database migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### Access database shell
```bash
docker-compose exec postgres psql -U engjell -d engjell_website
```

### Run Prisma Studio (database GUI)
```bash
docker-compose exec app npx prisma studio
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `DATABASE_URL`: PostgreSQL connection string
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: Database name
- `JWT_SECRET`: Secret key for JWT tokens
- `APP_PORT`: Application port (default: 7776)
- `NGINX_PORT`: Nginx port (default: 8080)

## Migration from SQLite to PostgreSQL

If you're migrating from SQLite:

1. **Export data from SQLite** (if needed):
   ```bash
   # On your old server
   sqlite3 data/database.db .dump > backup.sql
   ```

2. **Start Docker services**:
   ```bash
   docker-compose up -d
   ```

3. **Run migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

4. **Import data** (if you have SQL dumps):
   ```bash
   docker-compose exec -T postgres psql -U engjell -d engjell_website < backup.sql
   ```

## Production Deployment

For production:

1. **Use production profile** (includes Nginx):
   ```bash
   docker-compose --profile production up -d
   ```

2. **Set secure environment variables**:
   - Use strong passwords
   - Use secure JWT secret
   - Configure SSL/TLS certificates

3. **Configure domain**:
   - Update `nginx.conf` with your domain
   - Set up DNS records
   - Configure SSL certificates (Let's Encrypt)

4. **Backup database regularly**:
   ```bash
   docker-compose exec postgres pg_dump -U engjell engjell_website > backup.sql
   ```

## Troubleshooting

### Database connection errors
- Check if PostgreSQL container is running: `docker-compose ps`
- Verify DATABASE_URL in `.env` matches docker-compose settings
- Check PostgreSQL logs: `docker-compose logs postgres`

### Application won't start
- Check application logs: `docker-compose logs app`
- Verify build succeeded: `docker-compose build app`
- Check if migrations ran: `docker-compose exec app npx prisma migrate status`

### Port conflicts
- Change ports in `.env` file
- Update `docker-compose.yml` if needed

### Permission errors
- Ensure `public/uploads` directory exists and is writable
- Check Docker volume permissions

## Backup and Restore

### Backup database
```bash
docker-compose exec postgres pg_dump -U engjell engjell_website > backup_$(date +%Y%m%d).sql
```

### Restore database
```bash
docker-compose exec -T postgres psql -U engjell -d engjell_website < backup_20240101.sql
```

## Development

For development with hot reload:

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Run Next.js locally
npm run dev
```

Update your local `.env` to point to the Docker PostgreSQL:
```
DATABASE_URL=postgresql://engjell:changeme@localhost:5432/engjell_website?schema=public
```

