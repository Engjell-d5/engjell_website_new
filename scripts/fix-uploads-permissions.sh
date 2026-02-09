#!/bin/bash

###############################################################################
# Fix Uploads Directory Permissions
#
# This script fixes permissions for the uploads directory in Docker containers.
# It can be run on the server to fix permission issues.
#
# Usage:
#   ./scripts/fix-uploads-permissions.sh [container-name]
#
# Default container name: engjell-website-app
###############################################################################

set -e

CONTAINER_NAME="${1:-engjell-website-app}"
UPLOADS_DIR="/app/public/uploads"

echo "🔧 Fixing uploads directory permissions for container: $CONTAINER_NAME"

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Container '$CONTAINER_NAME' not found!"
    echo "Available containers:"
    docker ps -a --format '{{.Names}}'
    exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  Container is not running. Starting it..."
    docker start "$CONTAINER_NAME"
    sleep 2
fi

# Get the user that runs the Node.js process
echo "📋 Detecting container user..."
CONTAINER_USER=$(docker exec "$CONTAINER_NAME" sh -c "ps aux | grep node | grep -v grep | head -1 | awk '{print \$1}'" || echo "node")
CONTAINER_UID=$(docker exec "$CONTAINER_NAME" id -u "$CONTAINER_USER" 2>/dev/null || echo "1000")
CONTAINER_GID=$(docker exec "$CONTAINER_NAME" id -g "$CONTAINER_USER" 2>/dev/null || echo "1000")

echo "   User: $CONTAINER_USER (UID: $CONTAINER_UID, GID: $CONTAINER_GID)"

# Try to fix permissions as root
echo "🔐 Fixing ownership and permissions..."
if docker exec --user root "$CONTAINER_NAME" sh -c "chown -R $CONTAINER_UID:$CONTAINER_GID $UPLOADS_DIR 2>/dev/null && chmod -R 775 $UPLOADS_DIR 2>/dev/null"; then
    echo "✅ Permissions fixed successfully!"
else
    echo "⚠️  Could not fix permissions from inside container."
    echo ""
    echo "The directory might be a volume mount. Try fixing permissions on the host:"
    echo ""
    echo "1. Find the volume mount path:"
    echo "   docker inspect $CONTAINER_NAME | grep -A 10 Mounts"
    echo ""
    echo "2. Fix permissions on the host (replace /path/to/volume with actual path):"
    echo "   chown -R $CONTAINER_UID:$CONTAINER_GID /path/to/volume/public/uploads"
    echo "   chmod -R 775 /path/to/volume/public/uploads"
    echo ""
    echo "Or if the volume is in /var/lib/docker/volumes:"
    VOLUME_NAME=$(docker inspect "$CONTAINER_NAME" --format='{{range .Mounts}}{{if eq .Destination "/app"}}{{.Name}}{{end}}{{end}}' 2>/dev/null)
    if [ ! -z "$VOLUME_NAME" ]; then
        VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" --format='{{.Mountpoint}}' 2>/dev/null)
        if [ ! -z "$VOLUME_PATH" ]; then
            echo "   VOLUME_PATH=\"$VOLUME_PATH\""
            echo "   sudo chown -R $CONTAINER_UID:$CONTAINER_GID \"\$VOLUME_PATH/public/uploads\""
            echo "   sudo chmod -R 775 \"\$VOLUME_PATH/public/uploads\""
        fi
    fi
    exit 1
fi

# Verify permissions
echo "✅ Verifying permissions..."
docker exec "$CONTAINER_NAME" sh -c "test -w $UPLOADS_DIR && echo '   Directory is writable ✓' || echo '   Directory is NOT writable ✗'"

echo ""
echo "✅ Done! The uploads directory should now be writable."

