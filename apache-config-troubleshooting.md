# Apache Reverse Proxy Troubleshooting Guide

## Improved Apache VirtualHost Configuration

Here's a complete, improved Apache configuration for your Next.js app:

```apache
<VirtualHost *:80>
    ServerAdmin webmaster@engjellrraklli.com
    ServerName engjellrraklli.com
    ServerAlias www.engjellrraklli.com

    # Enable required modules (run these commands first)
    # sudo a2enmod proxy
    # sudo a2enmod proxy_http
    # sudo a2enmod proxy_wstunnel
    # sudo a2enmod rewrite
    # sudo a2enmod headers

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/engjell-website-error.log
    CustomLog ${APACHE_LOG_DIR}/engjell-website-access.log combined

    # Proxy settings
    ProxyPreserveHost On
    ProxyRequests Off
    
    # WebSocket support (improved)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:7776/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*) http://localhost:7776/$1 [P,L]

    # Alternative: Simple proxy without WebSocket rewrite
    # ProxyPass / http://localhost:7776/
    # ProxyPassReverse / http://localhost:7776/

    # Proxy headers for Next.js
    ProxyPass / http://localhost:7776/
    ProxyPassReverse / http://localhost:7776/
    
    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>

    # Additional proxy headers
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Port "80"
    RequestHeader set X-Real-IP %{REMOTE_ADDR}s

    # Timeouts
    ProxyTimeout 300
</VirtualHost>
```

## Troubleshooting Steps

### 1. Enable Required Apache Modules

```bash
# Ubuntu/Debian
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
sudo a2enmod headers

# Then reload Apache
sudo systemctl reload apache2
```

### 2. Check if VirtualHost is Enabled

```bash
# Check if your site is enabled
ls -la /etc/apache2/sites-enabled/ | grep engjell

# If not, enable it (assuming config is in sites-available)
sudo a2ensite engjell-website.conf
# or whatever your config file is named

# Then reload
sudo systemctl reload apache2
```

### 3. Test Apache Configuration

```bash
# Test configuration for syntax errors
sudo apache2ctl configtest
# or
sudo apache2 -t
```

### 4. Check Apache Error Logs

```bash
# View recent errors
sudo tail -f /var/log/apache2/error.log

# Or check your custom log
sudo tail -f /var/log/apache2/engjell-website-error.log
```

### 5. Verify Apache is Listening on Port 80

```bash
# Check if Apache is listening on port 80
sudo netstat -tlnp | grep :80
# or
sudo ss -tlnp | grep :80

# Check Apache status
sudo systemctl status apache2
```

### 6. Check Firewall for Port 80

```bash
# Ubuntu/Debian (ufw)
sudo ufw status
sudo ufw allow 80/tcp

# CentOS/RHEL (firewalld)
sudo firewall-cmd --list-ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### 7. Verify DNS is Pointing to Your Server

```bash
# Check if domain resolves to your server IP
nslookup engjellrraklli.com
dig engjellrraklli.com

# Test from your server
curl -I http://engjellrraklli.com
curl -I http://localhost:7776
```

### 8. Test Direct Connection

```bash
# Test if Next.js app is responding
curl http://localhost:7776

# Test if Apache can reach it
curl -H "Host: engjellrraklli.com" http://localhost
```

### 9. Check for Conflicting VirtualHosts

```bash
# List all enabled sites
ls -la /etc/apache2/sites-enabled/

# Check if another VirtualHost is catching your domain
sudo apache2ctl -S
```

### 10. Simple Test Configuration

If the above doesn't work, try this minimal config first:

```apache
<VirtualHost *:80>
    ServerName engjellrraklli.com
    ServerAlias www.engjellrraklli.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:7776/
    ProxyPassReverse / http://localhost:7776/
</VirtualHost>
```

## Common Issues and Solutions

### Issue: "Site can't be reached" or timeout
- **Solution**: Check firewall, DNS, and that Apache is running

### Issue: "403 Forbidden"
- **Solution**: Check file permissions and Proxy settings

### Issue: "502 Bad Gateway"
- **Solution**: Next.js app might not be running on port 7776, or Apache can't reach it

### Issue: Domain shows default Apache page
- **Solution**: VirtualHost not enabled or wrong ServerName

### Issue: Works with IP but not domain
- **Solution**: DNS not pointing correctly, or VirtualHost not matching domain

## Setting Up HTTPS/SSL for Apache

If you want to redirect HTTP to HTTPS (which is recommended), you need to set up SSL certificates first. Here's how:

### Step 1: Install Certbot (Let's Encrypt)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-apache

# CentOS/RHEL
sudo yum install certbot python3-certbot-apache
```

### Step 2: Enable SSL Module

```bash
sudo a2enmod ssl
sudo systemctl reload apache2
```

### Step 3: Obtain SSL Certificate

```bash
# This will automatically configure Apache for you
sudo certbot --apache -d engjellrraklli.com -d www.engjellrraklli.com

# Or if you want to do it manually:
sudo certbot certonly --apache -d engjellrraklli.com -d www.engjellrraklli.com
```

**If you get "Unable to find corresponding HTTP vhost" error:**

This means Certbot got the certificate but couldn't set up the redirect. You need to manually configure it:

1. **Check what VirtualHosts exist:**
```bash
sudo apache2ctl -S | grep engjell
ls -la /etc/apache2/sites-enabled/ | grep engjell
```

2. **View the SSL VirtualHost that Certbot created:**
```bash
sudo cat /etc/apache2/sites-enabled/engjellrraklli.com-le-ssl.conf
```

3. **Find or create the HTTP VirtualHost (port 80):**
```bash
# Check if HTTP VirtualHost exists
sudo cat /etc/apache2/sites-enabled/engjellrraklli.com.conf
# or
sudo cat /etc/apache2/sites-available/engjellrraklli.com.conf
```

4. **If HTTP VirtualHost exists, edit it to add redirect:**
```bash
sudo nano /etc/apache2/sites-enabled/engjellrraklli.com.conf
```

Make sure it looks like this (ONLY redirect, no proxy):
```apache
<VirtualHost *:80>
    ServerName engjellrraklli.com
    ServerAlias www.engjellrraklli.com
    
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>
```

5. **If HTTP VirtualHost doesn't exist, create it:**
```bash
sudo nano /etc/apache2/sites-available/engjellrraklli.com.conf
```

Add the redirect configuration above, then enable it:
```bash
sudo a2ensite engjellrraklli.com.conf
```

6. **Edit the SSL VirtualHost to add your proxy configuration:**
```bash
sudo nano /etc/apache2/sites-enabled/engjellrraklli.com-le-ssl.conf
```

Add these lines AFTER the SSL configuration (after `Include /etc/letsencrypt/options-ssl-apache.conf`):
```apache
    # Proxy settings
    ProxyPreserveHost On
    ProxyPass / http://localhost:7776/
    ProxyPassReverse / http://localhost:7776/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:7776/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*) http://localhost:7776/$1 [P,L]

    # Additional proxy headers
    RequestHeader set X-Forwarded-Proto "https"
```

7. **Test and reload:**
```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### Step 4: Complete Apache Configuration

After Certbot runs, you'll have two VirtualHosts. Here's what they should look like:

**HTTP VirtualHost (port 80) - Redirects to HTTPS:**
```apache
<VirtualHost *:80>
    ServerName engjellrraklli.com
    ServerAlias www.engjellrraklli.com
    
    # Redirect all HTTP traffic to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>
```

**HTTPS VirtualHost (port 443) - Your actual site:**
```apache
<VirtualHost *:443>
    ServerName engjellrraklli.com
    ServerAlias www.engjellrraklli.com

    # SSL Configuration (Certbot adds this)
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/engjellrraklli.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/engjellrraklli.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/engjell-website-error.log
    CustomLog ${APACHE_LOG_DIR}/engjell-website-access.log combined

    # Proxy settings
    ProxyPreserveHost On
    ProxyPass / http://localhost:7776/
    ProxyPassReverse / http://localhost:7776/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:7776/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*) http://localhost:7776/$1 [P,L]

    # Additional proxy headers
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
</VirtualHost>
```

### Step 5: Open Port 443 in Firewall

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 443/tcp

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Step 6: Test and Reload

```bash
# Test Apache configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2

# Test HTTPS
curl -I https://engjellrraklli.com
```

### Step 7: Auto-Renewal Setup

Certbot should set up auto-renewal automatically, but verify:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check if cron job exists
sudo systemctl status certbot.timer
```

### Manual Configuration (if Certbot doesn't work)

If you need to configure manually, create/edit these files:

**`/etc/apache2/sites-available/engjell-website.conf`** (HTTP - redirects):
```apache
<VirtualHost *:80>
    ServerName engjellrraklli.com
    ServerAlias www.engjellrraklli.com
    
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>
```

**`/etc/apache2/sites-available/engjell-website-ssl.conf`** (HTTPS - actual site):
```apache
<VirtualHost *:443>
    ServerName engjellrraklli.com
    ServerAlias www.engjellrraklli.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/engjellrraklli.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/engjellrraklli.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    ErrorLog ${APACHE_LOG_DIR}/engjell-website-error.log
    CustomLog ${APACHE_LOG_DIR}/engjell-website-access.log combined

    ProxyPreserveHost On
    ProxyPass / http://localhost:7776/
    ProxyPassReverse / http://localhost:7776/
    
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:7776/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*) http://localhost:7776/$1 [P,L]

    RequestHeader set X-Forwarded-Proto "https"
</VirtualHost>
```

Then enable both:
```bash
sudo a2ensite engjell-website.conf
sudo a2ensite engjell-website-ssl.conf
sudo systemctl reload apache2
```

## Quick Diagnostic Commands

Run these to get a full picture:

```bash
# 1. Check Apache status
sudo systemctl status apache2

# 2. Check enabled modules
apache2ctl -M | grep -E 'proxy|rewrite|headers'

# 3. Check enabled sites
apache2ctl -S

# 4. Check if port 80 is open
sudo netstat -tlnp | grep :80

# 5. Check firewall
sudo ufw status  # or firewall-cmd --list-all

# 6. Test Next.js app directly
curl http://localhost:7776

# 7. Test Apache proxy (should NOT redirect)
curl -I -H "Host: engjellrraklli.com" http://localhost

# 8. Check DNS
nslookup engjellrraklli.com

# 9. Find HTTPS redirect rules
sudo grep -r "RewriteRule.*https\|Redirect.*https" /etc/apache2/
```
