#!/bin/bash

###############################################################################
# Deploy Script for Engjell Rraklli Website (PM2-based)
#
# This script deploys the Next.js application to the production server using PM2.
# It:
# 1. Syncs code files to the server (excluding node_modules, .git, data, etc.)
# 2. Builds the Next.js app on the server
# 3. Installs dependencies
# 4. Configures firewall to allow app port
# 5. Creates/updates nginx configuration
# 6. Adds or restarts the PM2 process (doesn't create new PM2 ecosystem)
# 7. Reloads nginx
#
# Prerequisites:
# - SSH key access to root@division5.co
# - rsync installed locally (optional - script will use tar+ssh fallback if not available)
# - Node.js and npm installed on the server
# - PM2 installed globally on the server
# - Nginx installed and running on the server
# - PostgreSQL or SQLite3 installed on the server (for database operations)
#
# Usage: ./deploy.sh
#
# NOTE: For Docker deployment, use ./deploy-docker.sh instead
###############################################################################

set -e  # Exit on any error

# Configuration
SERVER_USER="root"
SERVER_HOST="division5.co"
SERVER_PORT="22"
REMOTE_DIR="/var/www/engjell-website"
APP_NAME="engjell-website"
APP_PORT="7776"
NGINX_PORT="8080"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/engjell-website"
NGINX_CONFIG_ENABLED="/etc/nginx/sites-enabled/engjell-website"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment to ${SERVER_HOST}...${NC}"

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

# Step 3: Configure firewall to allow app port
echo -e "${YELLOW}🔥 Configuring firewall to allow port ${APP_PORT}...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    # Try ufw (Ubuntu/Debian)
    if command -v ufw &> /dev/null; then
        if sudo ufw status | grep -q "Status: active"; then
            echo "Configuring ufw firewall..."
            sudo ufw allow ${APP_PORT}/tcp comment "Engjell Website Next.js App" || true
            echo "✅ Firewall rule added for port ${APP_PORT}"
        else
            echo "⚠️  UFW is installed but not active, skipping firewall configuration"
        fi
    # Try firewall-cmd (CentOS/RHEL/Fedora)
    elif command -v firewall-cmd &> /dev/null; then
        if sudo firewall-cmd --state &> /dev/null; then
            echo "Configuring firewalld..."
            sudo firewall-cmd --permanent --add-port=${APP_PORT}/tcp || true
            sudo firewall-cmd --reload || true
            echo "✅ Firewall rule added for port ${APP_PORT}"
        else
            echo "⚠️  Firewalld is installed but not active, skipping firewall configuration"
        fi
    # Try iptables directly
    elif command -v iptables &> /dev/null; then
        echo "Configuring iptables..."
        sudo iptables -C INPUT -p tcp --dport ${APP_PORT} -j ACCEPT 2>/dev/null || \
        sudo iptables -A INPUT -p tcp --dport ${APP_PORT} -j ACCEPT || true
        echo "✅ Firewall rule added for port ${APP_PORT}"
        # Try to save iptables rules (varies by distribution)
        if command -v iptables-save &> /dev/null; then
            sudo iptables-save > /etc/iptables/rules.v4 2>/dev/null || \
            sudo sh -c "iptables-save > /etc/iptables/rules.v4" 2>/dev/null || true
        fi
    else
        echo "⚠️  No firewall management tool found (ufw/firewall-cmd/iptables), skipping firewall configuration"
        echo "⚠️  Please manually allow port ${APP_PORT} in your firewall"
    fi
EOF

# Step 4: Create/update nginx configuration
echo -e "${YELLOW}⚙️  Creating/updating nginx configuration...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    NGINX_CONFIG_PATH="${NGINX_CONFIG_PATH}"
    NGINX_CONFIG_ENABLED="${NGINX_CONFIG_ENABLED}"
    
    cat > /tmp/engjell-website-nginx.conf << 'NGINX_CONFIG_EOF'
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

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:7776;
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
        proxy_pass http://localhost:7776;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Cache images
    location /images {
        proxy_pass http://localhost:7776;
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
    else
        echo "❌ Nginx configuration test failed!"
        exit 1
    fi
EOF

# Step 5: Install dependencies, build, and restart PM2 on server
echo -e "${YELLOW}🔄 Installing dependencies, building, and restarting application on server...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    cd ${REMOTE_DIR}
    
    # Ensure data directory exists with proper permissions
    echo "Ensuring data directory exists..."
    mkdir -p data
    chmod 755 data
    
    # Install/update dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Generate Prisma Client
    echo "Generating Prisma Client..."
    npm run db:generate || {
        echo "⚠️  Prisma Client generation failed, but continuing..."
    }
    
    # Run database migrations (creates tables if they don't exist)
    # Use --skip-seed to avoid interactive prompts
    echo "Running database migrations..."
    npx prisma migrate deploy || {
        echo "⚠️  Migration deploy failed, trying dev migration..."
        npx prisma migrate dev --name deploy || echo "⚠️  Migration may have failed or already exists, continuing..."
    }
    
    # Migrate data from JSON files if they exist and database is empty
    # Only run if database is new or empty
    echo "Checking if data migration is needed..."
    if command -v sqlite3 &> /dev/null; then
        if [ -f "data/database.db" ]; then
            USER_COUNT=\$(sqlite3 data/database.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
            if [ "\$USER_COUNT" = "0" ] && [ -f "data/users.json" ] && [ -s "data/users.json" ]; then
                echo "Database exists but is empty, migrating data from JSON files..."
                npm run db:seed || echo "⚠️  Data migration failed, but continuing..."
            else
                echo "Database already has data or no JSON files, skipping data migration"
            fi
        else
            # Database doesn't exist, try to migrate if JSON files exist
            if [ -f "data/users.json" ] && [ -s "data/users.json" ]; then
                echo "Database doesn't exist yet, running data migration..."
                npm run db:seed || echo "⚠️  Data migration failed, but continuing..."
            else
                echo "No database and no JSON files found, database will be created on first use"
            fi
        fi
    else
        echo "⚠️  sqlite3 not found, skipping data migration check"
        echo "⚠️  If this is first deployment, run 'npm run db:seed' manually after deployment"
    fi
    
    # Clear .next directory to ensure clean build (prevents stale build errors)
    echo "Clearing .next directory for clean build..."
    rm -rf .next
    
    # Build the Next.js application
    echo "Building Next.js application..."
    npm run build
    
    if [ \$? -ne 0 ]; then
        echo "❌ Build failed on server!"
        exit 1
    fi
    
    # Verify .next directory exists and contains build files
    echo "Verifying build output..."
    if [ ! -d ".next" ]; then
        echo "❌ .next directory not found after build!"
        exit 1
    fi
    
    # Check for critical build files
    if [ ! -f ".next/BUILD_ID" ] && [ ! -d ".next/server" ]; then
        echo "❌ Build incomplete - missing critical files in .next directory!"
        echo "Checking .next directory contents:"
        ls -la .next/ || true
        exit 1
    fi
    
    echo "✅ Build verification complete - .next directory exists with build files"
    
    # Stop and delete existing PM2 process if it exists
    echo "Stopping existing PM2 process..."
        pm2 delete ${APP_NAME} || true
    
    # Wait a moment for process to fully stop
    sleep 2
    
    # Start PM2 using ecosystem file with explicit PORT
    echo "Starting PM2 via ecosystem.config.js..."
    PORT=${APP_PORT} pm2 start ecosystem.config.js --only "${APP_NAME}"
        pm2 save
    
    # Wait a moment for the app to start
    sleep 3
    
    # Verify PM2 process is running
    if ! pm2 list | grep -q "${APP_NAME}.*online"; then
        echo "❌ PM2 process is not online! Checking logs..."
        pm2 logs ${APP_NAME} --lines 50 --nostream
        exit 1
    fi
    
    # Verify the app is listening on the correct port
    echo "Verifying app is listening on port ${APP_PORT}..."
    if ! (netstat -tuln 2>/dev/null | grep -q ":${APP_PORT} " || ss -tuln 2>/dev/null | grep -q ":${APP_PORT} "); then
        echo "⚠️  Warning: App might not be listening on port ${APP_PORT} yet. Checking PM2 logs..."
        pm2 logs ${APP_NAME} --lines 20 --nostream
        echo "⚠️  Continuing anyway - app might still be starting..."
    else
        echo "✅ App is listening on port ${APP_PORT}"
    fi
    
    # Reload nginx
    echo "Reloading nginx..."
    sudo systemctl reload nginx || sudo service nginx reload
    
    echo "✅ Deployment complete!"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}🌐 Application should be accessible on port ${NGINX_PORT}${NC}"
    echo -e "${GREEN}📡 Next.js app running on port ${APP_PORT}${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
