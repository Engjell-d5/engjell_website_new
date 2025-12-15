#!/bin/bash

###############################################################################
# Docker Deployment Script for Engjell Rraklli Website
#
# This script deploys the Next.js application using Docker and PostgreSQL.
# It:
# 1. Syncs code files to the server (excluding node_modules, .git, .next, etc.)
# 2. Ensures Docker and Docker Compose are installed
# 3. Copies .env file (if exists locally) or creates from .env.example
# 4. Builds and starts Docker containers
# 5. Runs database migrations
# 6. Configures firewall to allow app port
# 7. Creates/updates nginx configuration (optional, if not using Docker nginx)
#
# Prerequisites:
# - SSH key access to root@division5.co
# - Docker and Docker Compose installed on the server
# - rsync installed locally (optional - script will use tar+ssh fallback if not available)
#
# Usage: ./deploy-docker.sh
###############################################################################

set -e  # Exit on any error

# Configuration
SERVER_USER="root"
SERVER_HOST="division5.co"
SERVER_PORT="22"
REMOTE_DIR="/var/www/engjell-website"
APP_PORT="7776"
NGINX_PORT="8080"
POSTGRES_PORT="5433"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/engjell-website"
NGINX_CONFIG_ENABLED="/etc/nginx/sites-enabled/engjell-website"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Docker deployment to ${SERVER_HOST}...${NC}"
echo -e "${YELLOW}📡 All Docker commands will execute on remote server: ${SERVER_USER}@${SERVER_HOST}${NC}"

# Test SSH connection first
echo -e "${YELLOW}🔌 Testing SSH connection...${NC}"
if ! ssh -p ${SERVER_PORT} -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}${NC}"
    echo -e "${RED}   Please check your SSH configuration and ensure you have key-based access.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection verified${NC}"

# Step 1: Create remote directory if it doesn't exist
echo -e "${YELLOW}📁 Ensuring remote directory exists...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}"

# Step 2: Sync files to server (excluding node_modules, .git, .next, data files, etc.)
echo -e "${YELLOW}📤 Syncing files to server...${NC}"

# Check if rsync is available, otherwise use tar+ssh
if command -v rsync &> /dev/null; then
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'data/*.json' \
    --exclude 'data/*.db' \
    --exclude 'data/*.db-journal' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.*.local' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'public/uploads/' \
    -e "ssh -p ${SERVER_PORT}" \
    ./ ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/
    
    # Ensure uploads directory exists on server (but don't delete existing files)
    echo -e "${YELLOW}📁 Ensuring uploads directory exists on server...${NC}"
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}/public/uploads && chmod 755 ${REMOTE_DIR}/public/uploads"
else
    # Fallback: Use tar+ssh for Git Bash compatibility
    echo -e "${YELLOW}⚠️  rsync not found, using tar+ssh method...${NC}"
    # First, ensure uploads directory is preserved on server before extraction
    echo -e "${YELLOW}📁 Preserving uploads directory on server...${NC}"
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}/public/uploads && chmod 755 ${REMOTE_DIR}/public/uploads"
    
    tar --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.next' \
        --exclude='data/*.json' \
        --exclude='data/*.db' \
        --exclude='data/*.db-journal' \
        --exclude='.env' \
        --exclude='.env.local' \
        --exclude='.env.*.local' \
        --exclude='*.log' \
        --exclude='.DS_Store' \
        --exclude='public/uploads' \
        --exclude='public/uploads/*' \
        -czf - . | ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "cd ${REMOTE_DIR} && tar -xzf -"
    
    # Ensure uploads directory still exists and has correct permissions after extraction
    echo -e "${YELLOW}📁 Verifying uploads directory on server...${NC}"
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}/public/uploads && chmod 755 ${REMOTE_DIR}/public/uploads"
fi

# Step 3: Ensure Docker and Docker Compose are installed
echo -e "${YELLOW}🐳 Checking Docker installation...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << 'DOCKER_CHECK'
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed!"
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        systemctl enable docker
        systemctl start docker
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "Installing Docker Compose..."
        # Try docker compose (plugin) first
        if ! docker compose version &> /dev/null; then
            # Install docker-compose standalone
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
    fi
    
    echo "✅ Docker is ready"
DOCKER_CHECK

# Step 4: Setup .env file on server
echo -e "${YELLOW}⚙️  Setting up environment file...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    cd ${REMOTE_DIR}
    
    # If .env doesn't exist, create from .env.example
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            echo "Creating .env from .env.example..."
            cp .env.example .env
            echo "⚠️  Please edit .env file with your configuration!"
        else
            echo "❌ .env.example not found! Creating basic .env..."
            cat > .env << 'ENV_EOF'
DATABASE_URL=postgresql://engjell:changeme@postgres:5432/engjell_website?schema=public
POSTGRES_USER=engjell
POSTGRES_PASSWORD=changeme
POSTGRES_DB=engjell_website
POSTGRES_PORT=5432
NODE_ENV=production
APP_PORT=7776
NGINX_PORT=8080
JWT_SECRET=change-this-to-a-secure-random-string
ENV_EOF
            echo "⚠️  Please edit .env file with your secure passwords and configuration!"
        fi
    else
        echo "✅ .env file already exists, keeping it"
    fi
EOF

# Step 5: Configure firewall to allow app port
echo -e "${YELLOW}🔥 Configuring firewall to allow ports...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    # Allow app port
    if command -v ufw &> /dev/null; then
        if sudo ufw status | grep -q "Status: active"; then
            echo "Configuring ufw firewall..."
            sudo ufw allow ${APP_PORT}/tcp comment "Engjell Website Docker App" || true
            sudo ufw allow ${NGINX_PORT}/tcp comment "Engjell Website Nginx" || true
            echo "✅ Firewall rules added"
        fi
    elif command -v firewall-cmd &> /dev/null; then
        if sudo firewall-cmd --state &> /dev/null; then
            echo "Configuring firewalld..."
            sudo firewall-cmd --permanent --add-port=${APP_PORT}/tcp || true
            sudo firewall-cmd --permanent --add-port=${NGINX_PORT}/tcp || true
            sudo firewall-cmd --reload || true
            echo "✅ Firewall rules added"
        fi
    fi
EOF

# Step 6: Build and start Docker containers (ON REMOTE SERVER)
echo -e "${YELLOW}🐳 Building and starting Docker containers on remote server...${NC}"
echo -e "${YELLOW}   All docker-compose commands below execute on: ${SERVER_USER}@${SERVER_HOST}${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    cd ${REMOTE_DIR}
    
    # Stop existing containers
    echo "Stopping existing containers..."
    docker-compose down || docker compose down || true
    
    # Build images
    echo "Building Docker images..."
    docker-compose build --no-cache || docker compose build --no-cache
    
    # Start containers
    echo "Starting containers..."
    docker-compose up -d || docker compose up -d
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    until docker-compose exec -T postgres pg_isready -U engjell > /dev/null 2>&1 || docker compose exec -T postgres pg_isready -U engjell > /dev/null 2>&1; do
        echo "   Waiting for database..."
        sleep 2
    done
    
    echo "✅ PostgreSQL is ready"
    
    # Run database migrations
    echo "Running database migrations..."
    docker-compose exec -T app npx prisma migrate deploy || docker compose exec -T app npx prisma migrate deploy || {
        echo "⚠️  Migration deploy failed, trying dev migration..."
        docker-compose exec -T app npx prisma migrate dev --name deploy || docker compose exec -T app npx prisma migrate dev --name deploy || echo "⚠️  Migration may have failed or already exists, continuing..."
    }
    
    # Check if admin user exists, if not create one
    echo "Checking for admin user..."
    ADMIN_EXISTS=\$(echo "SELECT COUNT(*) FROM users WHERE role='admin';" | docker-compose exec -T app npx prisma db execute --stdin 2>/dev/null | grep -o '[0-9]' | head -1 || echo "0")
    if [ "\$ADMIN_EXISTS" = "0" ] || [ -z "\$ADMIN_EXISTS" ]; then
        echo "Creating admin user..."
        docker-compose exec -T app npm run init-admin || docker compose exec -T app npm run init-admin || echo "⚠️  Admin user creation failed, you may need to create it manually"
    else
        echo "✅ Admin user exists"
    fi
    
    # Verify containers are running
    echo "Verifying containers..."
    if docker-compose ps | grep -q "Up" || docker compose ps | grep -q "Up"; then
        echo "✅ Containers are running"
    else
        echo "⚠️  Some containers might not be running. Check logs:"
        docker-compose logs --tail=50 || docker compose logs --tail=50
    fi
EOF

# Step 7: Create/update nginx configuration (optional - if not using Docker nginx)
echo -e "${YELLOW}⚙️  Creating/updating nginx configuration (optional)...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    NGINX_CONFIG_PATH="${NGINX_CONFIG_PATH}"
    NGINX_CONFIG_ENABLED="${NGINX_CONFIG_ENABLED}"
    APP_PORT_VAL=${APP_PORT:-7776}
    
    # Only configure nginx if it's installed and not using Docker nginx
    if command -v nginx &> /dev/null; then
        cat > /tmp/engjell-website-nginx.conf << NGINX_CONFIG_EOF
server {
    listen 8080;
    server_name engjellrraklli.com www.engjellrraklli.com;

    # Increase body size limit for file uploads
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Proxy to Docker app
    location / {
        proxy_pass http://localhost:${APP_PORT_VAL};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:${APP_PORT};
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Cache images
    location /images {
        proxy_pass http://localhost:${APP_PORT};
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX_CONFIG_EOF
        sudo mv /tmp/engjell-website-nginx.conf \${NGINX_CONFIG_PATH}
        
        # Enable site if not already enabled
        if [ ! -L \${NGINX_CONFIG_ENABLED} ]; then
            sudo ln -s \${NGINX_CONFIG_PATH} \${NGINX_CONFIG_ENABLED}
        fi
        
        # Test nginx configuration
        if sudo nginx -t; then
            echo "✅ Nginx configuration is valid"
            sudo systemctl reload nginx || sudo service nginx reload
        else
            echo "⚠️  Nginx configuration test failed, but continuing..."
        fi
    else
        echo "⚠️  Nginx not installed, skipping nginx configuration"
        echo "   Using Docker nginx service instead (if enabled in docker-compose.yml)"
    fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker deployment completed successfully!${NC}"
    echo -e "${GREEN}🌐 Application should be accessible on port ${NGINX_PORT}${NC}"
    echo -e "${GREEN}🐳 Docker containers running${NC}"
    echo -e "${GREEN}📊 Check status with: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${REMOTE_DIR} && docker-compose ps'${NC}"
    echo -e "${GREEN}📋 View logs with: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${REMOTE_DIR} && docker-compose logs -f'${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

