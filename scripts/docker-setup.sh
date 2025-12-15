#!/bin/bash

# Docker setup script for Engjell Website
# This script helps set up the Docker environment

set -e

echo "🐳 Docker Setup for Engjell Website"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing!"
    echo ""
    read -p "Press Enter after you've edited .env file..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Wait for PostgreSQL to be healthy
until docker-compose exec -T postgres pg_isready -U engjell > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done

echo "✅ PostgreSQL is ready"
echo ""

# Run migrations
echo "📊 Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

echo ""
echo "🔑 Creating admin user..."
echo "   Default: admin@engjellrraklli.com / admin123"
docker-compose exec -T app npm run init-admin || echo "⚠️  Admin user might already exist"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access your application:"
echo "   - Website: http://localhost:3000"
echo "   - Admin: http://localhost:3000/admin/login"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop: docker-compose down"
echo "   - Restart: docker-compose restart"
echo "   - Database shell: docker-compose exec postgres psql -U engjell -d engjell_website"

