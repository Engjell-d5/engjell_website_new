#!/bin/bash

# Quick fix script to rebuild and restart the application
# Run on server: bash /var/www/engjell-website/scripts/rebuild-and-restart.sh

set -e

APP_NAME="engjell-website"
APP_PORT="7776"
REMOTE_DIR="/var/www/engjell-website"

cd ${REMOTE_DIR}

echo "=== Rebuilding and Restarting Application ==="
echo ""

# Stop PM2 process
echo "1. Stopping PM2 process..."
pm2 delete ${APP_NAME} || true
sleep 2

# Clear .next directory
echo "2. Clearing .next directory..."
rm -rf .next

# Build the application
echo "3. Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Verify build
echo "4. Verifying build..."
if [ ! -d ".next" ]; then
    echo "❌ .next directory not found after build!"
    exit 1
fi

if [ ! -f ".next/BUILD_ID" ] && [ ! -d ".next/server" ]; then
    echo "❌ Build incomplete - missing critical files!"
    ls -la .next/ || true
    exit 1
fi

echo "✅ Build verified"

# Start PM2
echo "5. Starting PM2..."
PORT=${APP_PORT} pm2 start ecosystem.config.js --only "${APP_NAME}"
pm2 save

# Wait for startup
sleep 3

# Verify it's running
echo "6. Verifying PM2 status..."
if pm2 list | grep -q "${APP_NAME}.*online"; then
    echo "✅ PM2 process is online"
else
    echo "❌ PM2 process is not online! Checking logs..."
    pm2 logs ${APP_NAME} --lines 30 --nostream
    exit 1
fi

# Check if listening on port
echo "7. Checking if app is listening on port ${APP_PORT}..."
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":${APP_PORT} "; then
        echo "✅ App is listening on port ${APP_PORT}"
    else
        echo "⚠️  App might not be listening yet. Check logs: pm2 logs ${APP_NAME}"
    fi
elif command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":${APP_PORT} "; then
        echo "✅ App is listening on port ${APP_PORT}"
    else
        echo "⚠️  App might not be listening yet. Check logs: pm2 logs ${APP_NAME}"
    fi
fi

echo ""
echo "=== Rebuild and Restart Complete ==="
echo "Check status with: pm2 list"
echo "Check logs with: pm2 logs ${APP_NAME}"

