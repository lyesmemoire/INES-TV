import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking Match table...");
  try {
    const count = await prisma.match.count();
    console.log(`📊 Count in Match: ${count}`);
    
    if (count > 0) {
      const matches = await prisma.match.findMany({
        take: 5,
        include: { streams: true }
      });
      console.log('✅ Sample matches found:');
      matches.forEach(m => {
        console.log(` - ${m.homeTeam} vs ${m.awayTeam} (Status: ${m.status}, Streams: ${m.streams.length})`);
      });
    } else {
      console.log("⚠️ Match table is empty!");
    }
  } catch (e) {
    console.error("❌ Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
