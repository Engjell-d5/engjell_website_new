#!/bin/bash

###############################################################################
# Deploy Script for Engjell Rraklli Website
#
# This script deploys the Next.js application to the production server.
# It:
# 1. Syncs code files to the server (excluding node_modules, .git, data, etc.)
# 2. Builds the Next.js app on the server
# 3. Installs dependencies
# 4. Adds or restarts the PM2 process (doesn't create new PM2 ecosystem)
# 5. Reloads nginx
#
# Prerequisites:
# - SSH key access to root@division5.co
# - rsync installed locally
# - Node.js and npm installed on the server
# - PM2 installed globally on the server
# - Existing nginx configuration pointing to port 8081
#
# Usage: ./deploy.sh
###############################################################################

set -e  # Exit on any error

# Configuration
SERVER_USER="root"
SERVER_HOST="division5.co"
SERVER_PORT="22"
REMOTE_DIR="/var/www/engjell-website"
APP_NAME="engjell-website"
NGINX_PORT="8081"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting deployment to ${SERVER_HOST}...${NC}"

# Step 1: Create remote directory if it doesn't exist
echo -e "${YELLOW}📁 Ensuring remote directory exists...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}"

# Step 2: Sync files to server (excluding node_modules, .git, .next, data, etc.)
echo -e "${YELLOW}📤 Syncing files to server...${NC}"
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'data' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.*.local' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'scripts' \
    -e "ssh -p ${SERVER_PORT}" \
    ./ ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/

# Step 3: Install dependencies, build, and restart PM2 on server
echo -e "${YELLOW}🔄 Installing dependencies, building, and restarting application on server...${NC}"
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << EOF
    set -e
    cd ${REMOTE_DIR}
    
    # Install/update dependencies
    echo "Installing dependencies..."
    npm ci
    
    # Build the Next.js application
    echo "Building Next.js application..."
    npm run build
    
    if [ \$? -ne 0 ]; then
        echo "❌ Build failed on server!"
        exit 1
    fi
    
    # Check if PM2 process exists, if not add it, otherwise restart
    if pm2 list | grep -q "${APP_NAME}"; then
        echo "Restarting existing PM2 process..."
        pm2 restart ${APP_NAME}
    else
        echo "Adding new PM2 process..."
        # Start Next.js (PORT env var should be set in .env file on server if needed)
        pm2 start npm --name "${APP_NAME}" -- start
        pm2 save
    fi
    
    # Reload nginx
    echo "Reloading nginx..."
    sudo systemctl reload nginx || sudo service nginx reload
    
    echo "✅ Deployment complete!"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}🌐 Application should be running on port ${NGINX_PORT}${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
