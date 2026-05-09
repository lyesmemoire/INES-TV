import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking Free Channels...");
  const channels = await prisma.freeChannel.findMany({
    include: { streams: true }
  });

  if (channels.length === 0) {
    console.log("❌ No free channels found in database.");
    return;
  }

  channels.forEach(ch => {
    console.log(`📺 [${ch.id}] ${ch.name} (Slug: ${ch.slug})`);
    console.log(`   Status: ${ch.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   Streams: ${ch.streams.length}`);
    ch.streams.forEach(s => {
      console.log(`     - [${s.type}] ${s.url} (Active: ${s.isActive})`);
    });
    console.log('---');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
