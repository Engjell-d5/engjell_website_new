#!/bin/bash

# Diagnostic script to check server status
# Usage: Run on server via SSH: bash /var/www/engjell-website/scripts/check-server.sh

APP_NAME="engjell-website"
APP_PORT="7776"

echo "=== Server Diagnostic Check ==="
echo ""

echo "1. Checking PM2 status..."
pm2 list | grep -E "NAME|${APP_NAME}" || echo "❌ PM2 process not found"
echo ""

echo "2. Checking PM2 logs (last 20 lines)..."
pm2 logs ${APP_NAME} --lines 20 --nostream || echo "❌ Could not read PM2 logs"
echo ""

echo "3. Checking if port ${APP_PORT} is listening..."
if command -v netstat &> /dev/null; then
    netstat -tuln | grep ":${APP_PORT} " || echo "❌ Port ${APP_PORT} is not listening"
elif command -v ss &> /dev/null; then
    ss -tuln | grep ":${APP_PORT} " || echo "❌ Port ${APP_PORT} is not listening"
else
    echo "⚠️  netstat/ss not available, cannot check port"
fi
echo ""

echo "4. Testing local connection to port ${APP_PORT}..."
if command -v curl &> /dev/null; then
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:${APP_PORT} || echo "❌ Could not connect to localhost:${APP_PORT}"
else
    echo "⚠️  curl not available, cannot test connection"
fi
echo ""

echo "5. Checking nginx status..."
if command -v systemctl &> /dev/null; then
    systemctl status nginx --no-pager -l | head -10 || echo "⚠️  Could not check nginx status"
else
    service nginx status | head -10 || echo "⚠️  Could not check nginx status"
fi
echo ""

echo "6. Checking nginx error logs (last 10 lines)..."
if [ -f /var/log/nginx/error.log ]; then
    tail -10 /var/log/nginx/error.log
else
    echo "⚠️  Nginx error log not found at /var/log/nginx/error.log"
fi
echo ""

echo "7. Checking process environment..."
pm2 env ${APP_NAME} | grep -E "PORT|NODE_ENV" || echo "⚠️  Could not read PM2 environment"
echo ""

echo "=== Diagnostic Complete ==="

