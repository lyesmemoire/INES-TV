
import { prisma } from '../lib/prisma';

async function main() {
  const matches = await prisma.match.findMany({
    orderBy: { startTime: 'desc' },
    take: 20,
    select: {
      homeTeam: true,
      awayTeam: true,
      status: true,
      startTime: true,
      isFeatured: true,
      featuredUntil: true,
      score: true,
    }
  });
  console.log(JSON.stringify(matches, null, 2));
}

main().catch(console.error);
