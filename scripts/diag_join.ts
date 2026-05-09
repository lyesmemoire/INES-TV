import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Querying FreeChannel + FreeStream for 'tf1'...");
  const channel = await prisma.freeChannel.findUnique({
    where: { slug: 'tf1' },
    include: { streams: true }
  });

  if (!channel) {
    console.log("❌ Channel 'tf1' not found.");
    return;
  }

  console.log(`✅ Channel: ${channel.name} (ID: ${channel.id})`);
  console.log(`📊 Streams Count: ${channel.streams.length}`);
  
  channel.streams.forEach(s => {
    console.log(`   - [${s.type}] ${s.url} (Active: ${s.isActive})`);
  });

  if (channel.streams.length > 0) {
    const stream = channel.streams[0];
    console.log(`\n🧐 Player Compatibility Check:`);
    console.log(`   Type in DB: "${stream.type}"`);
    console.log(`   Expected in FTAPlayer: "M3U8"`);
    console.log(`   Match: ${stream.type === "M3U8" ? "✅ YES" : "❌ NO"}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
