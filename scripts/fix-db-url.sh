#!/bin/bash
# Helper script to fix DATABASE_URL for host access with URL-encoded password

set -e

echo "🔧 Fixing DATABASE_URL for host access..."

# Get the password from .env
PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$PASSWORD" ]; then
    echo "❌ POSTGRES_PASSWORD not found in .env"
    exit 1
fi

echo "📝 Password found: ${PASSWORD:0:3}***"

# URL-encode the password
# Disable history expansion to handle ! characters
set +H
if command -v python3 &> /dev/null; then
    # Pipe password to Python to avoid shell interpretation issues
    ENCODED_PASSWORD=$(echo -n "$PASSWORD" | python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.stdin.read().strip(), safe=''))")
else
    # Fallback: encode common special characters manually
    ENCODED_PASSWORD=$(echo -n "$PASSWORD" | sed 's/@/%40/g; s/!/%21/g; s/#/%23/g; s/\$/%24/g; s/&/%26/g; s/+/%2B/g; s/=/%3D/g; s/?/%3F/g')
fi
set -H

echo "🔐 URL-encoded password: ${ENCODED_PASSWORD:0:10}***"

# Backup .env
cp .env .env.backup

# Remove old SQLite DATABASE_URL if exists
sed -i '/^DATABASE_URL=.*file:.*database\.db/d' .env

# Remove any existing PostgreSQL DATABASE_URL
sed -i '/^DATABASE_URL=postgresql:\/\/.*@postgres:5432/d' .env
sed -i '/^DATABASE_URL=postgresql:\/\/.*@localhost:5434/d' .env

# Add new DATABASE_URL with URL-encoded password (using port 5434 to avoid conflicts)
echo "DATABASE_URL=postgresql://engjell:${ENCODED_PASSWORD}@localhost:5434/engjell_website?schema=public" >> .env

echo "✅ DATABASE_URL updated!"
echo ""
echo "Current DATABASE_URL:"
grep "^DATABASE_URL=postgresql://" .env

