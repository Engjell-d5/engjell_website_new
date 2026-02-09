# Fix Uploads Directory Permissions

## Problem
The `/app/public/uploads` directory is owned by `root`, but the Node.js process runs as a different user, causing permission denied errors.

## Quick Fix

Run these commands on your server:

```bash
# 1. Find what user runs the Node.js process
docker exec engjell-website-app ps aux | grep node | grep -v grep | head -1

# 2. Fix ownership (replace 'node' with the actual user from step 1, or use UID 1000 which is common)
docker exec --user root engjell-website-app sh -c "chown -R 1000:1000 /app/public/uploads && chmod -R 775 /app/public/uploads"
```

## Alternative: If you know the exact user

If the Node.js process runs as user `node` (UID 1000 is common for node):

```bash
docker exec --user root engjell-website-app sh -c "chown -R node:node /app/public/uploads && chmod -R 775 /app/public/uploads"
```

## Verify the fix

```bash
# Check ownership
docker exec engjell-website-app ls -la /app/public/ | grep uploads

# Test if writable
docker exec engjell-website-app sh -c "test -w /app/public/uploads && echo 'Writable ✓' || echo 'NOT writable ✗'"
```

## Prevent future issues

To prevent this from happening again, ensure the directory is created with correct permissions. The code now creates it with mode `775`, but if it already exists as root, you need to fix it manually first.

