#!/bin/bash

set -e

echo "🚀 StreamPerf Setup Script"
echo "=========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your credentials"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ssl
mkdir -p logs

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose pull

# Build application
echo "🔨 Building application..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo "🏥 Checking health..."
docker-compose ps

# Show logs
echo "📋 Showing logs..."
docker-compose logs --tail=50

echo ""
echo "✅ Setup complete!"
echo "🌐 Application: http://localhost:3000"
echo "🔴 Redis Commander: http://localhost:8081"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart"
echo "  - Rebuild: docker-compose up -d --build"
