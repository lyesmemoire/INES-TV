#!/bin/bash

set -e

echo "💾 StreamPerf Backup Script"
echo "============================"

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p ${BACKUP_DIR}

echo "📦 Creating backup at: ${BACKUP_DIR}"

# Backup Redis data
echo "💾 Backing up Redis..."
docker-compose exec -T redis redis-cli SAVE
docker cp streamperf-redis:/data/dump.rdb ${BACKUP_DIR}/redis-dump.rdb

# Backup environment variables
echo "📝 Backing up environment..."
cp .env ${BACKUP_DIR}/.env

# Backup Docker volumes
echo "🗄️  Backing up volumes..."
docker run --rm \
  -v streamperf_redis-data:/data \
  -v ${BACKUP_DIR}:/backup \
  alpine tar czf /backup/redis-volume.tar.gz -C /data .

# Create archive
echo "🗜️  Creating archive..."
tar czf ${BACKUP_DIR}.tar.gz -C ./backups $(basename ${BACKUP_DIR})
rm -rf ${BACKUP_DIR}

echo "✅ Backup complete: ${BACKUP_DIR}.tar.gz"

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find ./backups -name "*.tar.gz" -mtime +7 -delete

echo "✅ Done!"
