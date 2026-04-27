#!/bin/bash

set -e

echo "🚀 StreamPerf Deployment Script"
echo "==============================="

# Variables
SERVER_USER=${1:-"deploy"}
SERVER_HOST=${2:-"streamperf.com"}
DEPLOY_PATH="/opt/streamperf"

echo "📡 Deploying to: ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}"

# Build Docker image locally
echo "🔨 Building Docker image..."
docker build -t streamperf:latest \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}" \
  .

# Save image to tar
echo "📦 Exporting image..."
docker save streamperf:latest | gzip > streamperf-latest.tar.gz

# Copy to server
echo "📤 Uploading to server..."
scp streamperf-latest.tar.gz ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/

# SSH into server and deploy
echo "🚀 Deploying on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
  cd /opt/streamperf
  
  # Load image
  docker load < streamperf-latest.tar.gz
  
  # Stop old containers
  docker-compose -f docker-compose.prod.yml down
  
  # Start new containers
  docker-compose -f docker-compose.prod.yml up -d
  
  # Cleanup
  rm streamperf-latest.tar.gz
  docker system prune -af
  
  # Check health
  sleep 10
  curl -f http://localhost:3000/api/health || echo "⚠️  Health check failed"
EOF

# Cleanup local tar
rm streamperf-latest.tar.gz

echo "✅ Deployment complete!"
echo "🌐 Visit: https://${SERVER_HOST}"
