# StreamPerf Production Deployment Script

# 1. Build and start containers
echo "🚀 Building and starting containers..."
docker-compose up -d --build

# 2. Wait for DB to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# 3. Synchronize database schema
echo "🔄 Synchronizing database schema..."
docker-compose exec app npx prisma db push

# 4. Seed initial ad providers and configuration
echo "🌱 Seeding ad providers..."
docker-compose exec app npx tsx prisma/seed_ads.ts

echo "✅ Deployment complete! Access your app at http://localhost:3000"
