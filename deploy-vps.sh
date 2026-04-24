#!/bin/bash

# ==========================================
# OTT MVP GO-LIVE SCRIPT (VPS 5$)
# ==========================================
# Run this on your fresh Ubuntu VPS
# It configures NTP, installs PM2, and sets up log rotation to prevent disk full.

echo "🚀 Starting OTT MVP VPS Provisioning..."

# 1. TIME SYNC (CRITICAL FOR HMAC TOKENS)
echo "🕒 Fixing Server Time (NTP)..."
sudo timedatectl set-ntp true
sudo apt-get update
sudo apt-get install -y ntp
sudo systemctl enable ntp
sudo systemctl start ntp

# 2. PM2 & LOG ROTATION (CRITICAL FOR AUTO-RECOVERY & DISK SIZE)
echo "🛠️ Installing PM2 and LogRotate..."
npm install -g pm2
pm2 install pm2-logrotate

# Prevent logs from filling up the $5 VPS SSD (Keep max 5 files of 10MB each)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 5
pm2 set pm2-logrotate:compress true

# 3. STARTING THE APP IN PRODUCTION MODE
echo "⚡ Starting OTT App with PM2..."
# Assuming you have compiled TypeScript or are running via tsx/ts-node.
# Adjust the entry point (e.g., dist/server.js) as needed.
npm run build
pm2 start dist/server.js --name ott-mvp

# 4. AUTO-RESTART ON VPS REBOOT
echo "🛡️ Saving PM2 startup script..."
pm2 save
pm2 startup

echo "✅ GO-LIVE SETUP COMPLETE."
echo "Use 'pm2 logs ott-mvp' to view logs."
