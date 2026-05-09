const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🏟️ SEED SCRIPT: Phase 2 Industrialization
 * Goal: Insert 2-3 production-ready matches without featuring them.
 * This script is IDEMPOTENT (checks for existing slugs).
 */
async function main() {
  console.log('🚀 Starting Match Seeding (Phase 2)...');

  const matches = [
    {
      homeTeam: 'Paris Saint-Germain',
      awayTeam: 'Olympique de Marseille',
      competition: 'Ligue 1',
      startTime: new Date('2026-05-10T20:45:00Z'),
      status: 'UPCOMING',
      score: '0-0',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
      slug: 'paris-saint-germain-vs-olympique-de-marseille-ligue-1-live-stream',
      isFeatured: false,
    },
    {
      homeTeam: 'Real Madrid',
      awayTeam: 'FC Barcelona',
      competition: 'La Liga',
      startTime: new Date('2026-05-11T20:00:00Z'),
      status: 'UPCOMING',
      score: '0-0',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
      slug: 'real-madrid-vs-fc-barcelona-la-liga-live-stream',
      isFeatured: false,
    }
  ];

  for (const match of matches) {
    const existing = await prisma.match.findUnique({
      where: { slug: match.slug }
    });

    if (existing) {
      console.log(`[SEED] Match already exists: ${match.homeTeam} vs ${match.awayTeam} (${match.slug})`);
    } else {
      const created = await prisma.match.create({
        data: match
      });
      console.log(`[SEED] Created match: ${created.homeTeam} vs ${created.awayTeam} (ID: ${created.id})`);
      
      // Add a test stream for the match
      await prisma.stream.create({
        data: {
          matchId: created.id,
          type: 'hls',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          priority: 1,
          isActive: true
        }
      });
      console.log(`[SEED] Added test stream to ${created.slug}`);
    }
  }

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
