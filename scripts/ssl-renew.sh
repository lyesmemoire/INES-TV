#!/bin/bash
# StreamPerf / Anis-tv SSL Renewal Script
# This script manually triggers a Certbot renewal and reloads Nginx.

echo "⏳ Starting SSL renewal process..."

# 1. Run Certbot renewal
# Note: The docker-compose entrypoint already does this every 12h, 
# but this script is for manual intervention.
docker compose run --rm certbot renew

# 2. Reload Nginx to pick up new certificates
echo "🔄 Reloading Nginx configuration..."
docker compose exec nginx nginx -s reload

echo "✅ SSL Renewal attempt complete. Verify certificate dates with: openssl s_client -connect your-domain.com:443 -servername your-domain.com"
