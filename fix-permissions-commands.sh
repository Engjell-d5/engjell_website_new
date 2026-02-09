#!/bin/bash
# Complete fix for uploads directory permissions
# Run these commands on your server

CONTAINER="engjell-website-app"

echo "Step 1: Finding Node.js process user..."
NODE_USER=$(docker exec $CONTAINER ps aux | grep node | grep -v grep | head -1 | awk '{print $1}')
NODE_UID=$(docker exec $CONTAINER id -u $NODE_USER 2>/dev/null || echo "1000")
NODE_GID=$(docker exec $CONTAINER id -g $NODE_USER 2>/dev/null || echo "1000")

echo "   User: $NODE_USER (UID: $NODE_UID, GID: $NODE_GID)"
echo ""

echo "Step 2: Fixing public directory permissions..."
docker exec --user root $CONTAINER sh -c "chown -R $NODE_UID:$NODE_GID /app/public && chmod -R 775 /app/public"

echo "Step 3: Ensuring uploads directory exists with correct permissions..."
docker exec --user root $CONTAINER sh -c "mkdir -p /app/public/uploads && chown -R $NODE_UID:$NODE_GID /app/public/uploads && chmod -R 775 /app/public/uploads"

echo "Step 4: Verifying permissions..."
docker exec $CONTAINER ls -la /app/public/ | grep -E "(public|uploads)"
docker exec $CONTAINER sh -c "test -w /app/public/uploads && echo '✅ Directory is writable' || echo '❌ Directory is NOT writable'"

echo ""
echo "Done! Try uploading an image now."

