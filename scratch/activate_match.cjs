const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🏟️ Activating 1 Featured Match...');
  
  const match = await prisma.match.findUnique({
    where: { slug: 'paris-saint-germain-vs-olympique-de-marseille-ligue-1-live-stream' }
  });

  if (!match) {
    console.log('❌ Match not found');
    return;
  }

  await prisma.match.update({
    where: { id: match.id },
    data: { 
      isFeatured: true,
      featuredOrder: 1,
      status: 'LIVE' // Set to LIVE to ensure it passes the filter
    }
  });

  console.log(`✅ Match ${match.homeTeam} vs ${match.awayTeam} is now FEATURED.`);
}

main().finally(() => prisma.$disconnect());
