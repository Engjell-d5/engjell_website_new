#!/bin/bash
# Quick script to check Docker container status and connectivity

echo "🔍 Checking Docker container status..."
echo ""

# Check if containers are running
echo "📦 Container Status:"
docker compose ps
echo ""

# Check if app is listening on port 7776
echo "🔌 Checking if app is listening on port 7776:"
if netstat -tlnp 2>/dev/null | grep -q ":7776" || ss -tlnp 2>/dev/null | grep -q ":7776"; then
    echo "✅ Port 7776 is in use"
    netstat -tlnp 2>/dev/null | grep ":7776" || ss -tlnp 2>/dev/null | grep ":7776"
else
    echo "❌ Port 7776 is NOT in use - app might not be running"
fi
echo ""

# Check app container logs
echo "📋 Recent app container logs:"
docker compose logs --tail=20 app
echo ""

# Test direct connection to app
echo "🌐 Testing direct connection to app:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:7776 | grep -q "200\|301\|302"; then
    echo "✅ App is responding on port 7776"
else
    echo "❌ App is NOT responding on port 7776"
    echo "   Trying to connect..."
    curl -v http://localhost:7776 2>&1 | head -20
fi
echo ""

# Check nginx config
echo "⚙️  Checking nginx configuration:"
if [ -f /etc/nginx/sites-available/engjell-website ]; then
    echo "Nginx config file exists:"
    grep -A 2 "proxy_pass" /etc/nginx/sites-available/engjell-website | head -5
else
    echo "⚠️  Nginx config file not found at /etc/nginx/sites-available/engjell-website"
fi

