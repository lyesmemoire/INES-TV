#!/bin/bash

# ==========================================
# GOALA PRODUCTION DEPLOYMENT SCRIPT (v1.1)
# ==========================================
# Architecture: Cloudflare -> Nginx -> PM2 (Next.js Standalone)

set -e # Exit on error

echo "🚀 Starting Production Deployment for GOALA..."

# 1. Pull Latest Code
echo "📥 Pulling latest code from main..."
git pull origin main

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm install --frozen-lockfile

# 3. Build Next.js Application
echo "🏗️ Building application (Standalone mode)..."
npm run build

# 4. Prepare Standalone Distribution (Critical for assets)
echo "📂 Preparing standalone distribution..."
# Copy static and public to standalone folder as per Next.js docs
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 5. Process Management with PM2
echo "🔄 Restarting application with PM2..."
# Ensure logs directory exists
mkdir -p logs
pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs

# 6. Save PM2 state
pm2 save

echo "✅ DEPLOYMENT COMPLETE."
echo "--------------------------------"
echo "Check status:  pm2 list"
echo "Monitor:       pm2 monit"
echo "Logs:          pm2 logs goala"
echo "Health:        curl http://localhost:3000/api/health"
