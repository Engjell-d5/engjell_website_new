#!/bin/bash
###############################################################################
# Server-side bootstrap for the new CI-built deployment flow.
#
# Run ONCE on the production server (division5.co) to:
#   1) Install the GitHub Actions deploy public key into root's authorized_keys
#   2) Copy docker-compose.prod.yml into the deploy directory
#   3) Ensure .env exists (kept from prior deploys if already present)
#
# After running this, every push to main will:
#   - Build the image in GitHub Actions
#   - Push to ghcr.io/engjell-d5/engjell_website_new:latest
#   - SSH in and run `docker compose -f docker-compose.prod.yml pull && up -d`
#
# Run as root on the server:
#   curl -sSL https://raw.githubusercontent.com/Engjell-d5/engjell_website_new/main/scripts/server-bootstrap.sh | bash
#
# Or copy the file across manually and run: bash scripts/server-bootstrap.sh
###############################################################################
set -e

REMOTE_DIR="${REMOTE_DIR:-/var/www/engjell-website}"
PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO9A+hETeOCg7m98LRnSLvo1gfVTrxnKgQMblctu420U github-actions-deploy@engjell-rraklli-website"

echo "==> Installing GitHub Actions deploy public key..."
mkdir -p /root/.ssh
chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
if ! grep -qF "$PUBLIC_KEY" /root/.ssh/authorized_keys; then
  echo "$PUBLIC_KEY" >> /root/.ssh/authorized_keys
  echo "    Public key added."
else
  echo "    Public key already present."
fi

echo "==> Ensuring deploy directory exists at $REMOTE_DIR"
mkdir -p "$REMOTE_DIR"
mkdir -p "$REMOTE_DIR/public/uploads"
chmod 755 "$REMOTE_DIR/public/uploads"
mkdir -p "$REMOTE_DIR/data"

echo "==> Fetching docker-compose.prod.yml from main branch..."
curl -fsSL \
  https://raw.githubusercontent.com/Engjell-d5/engjell_website_new/main/docker-compose.prod.yml \
  -o "$REMOTE_DIR/docker-compose.prod.yml"

if [ ! -f "$REMOTE_DIR/.env" ]; then
  echo "==> No .env found at $REMOTE_DIR/.env"
  echo "    Create it before the first deploy. Minimum required keys:"
  echo "      POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB"
  echo "      JWT_SECRET, NEXT_PUBLIC_SITE_URL"
  echo "      (plus any social/OAuth/API keys you use)"
else
  echo "==> Existing .env preserved at $REMOTE_DIR/.env"
fi

echo "==> Logging in to GHCR is NOT required (image is public)."

echo ""
echo "Bootstrap complete."
echo ""
echo "Next steps:"
echo "  1) Edit $REMOTE_DIR/.env with your production secrets if not already set."
echo "  2) Push to main (or run the workflow manually) to trigger the first deploy."
echo "     - Build runs in GitHub Actions"
echo "     - Workflow then SSHes in here and runs docker compose pull && up -d"
echo ""
echo "Manual deploy (if needed):"
echo "  cd $REMOTE_DIR"
echo "  docker compose -f docker-compose.prod.yml pull"
echo "  docker compose -f docker-compose.prod.yml up -d"
