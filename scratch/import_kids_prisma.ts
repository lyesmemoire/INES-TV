import { PrismaClient } from '@prisma/client';
import { parseM3U } from '../src/lib/iptv/parseM3U';

const prisma = new PrismaClient();

async function run() {
  console.log("Fetching new M3U playlist...");
  const url = "https://t.freetv.fun/m3u/kids_original.m3u";
  const res = await fetch(url);
  const text = await res.text();

  console.log("Parsing M3U playlist...");
  const parsedChannels = parseM3U(text);
  console.log(`Found ${parsedChannels.length} channels in the playlist.`);

  console.log("Starting DB clear...");
  await prisma.$executeRawUnsafe('TRUNCATE TABLE public."Channel" CASCADE;');
  console.log(`Successfully cleared existing channels and cascading tables.`);

  console.log("Inserting new channels...");
  const batchSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < parsedChannels.length; i += batchSize) {
    const batch = parsedChannels.slice(i, i + batchSize);
    
    const data = batch.map((ch: any, idx: number) => {
        // Generate a valid ID if none exists
        const id = ch.id || ch.tvgId || `kids_${i + idx}_${Date.now()}`;
        return {
            id: id,
            name: ch.name || "Unknown",
            streamUrl: ch.url || "",
            logo: ch.logo || null,
            category: ch.group || ch.category || "Kids",
            isActive: true,
            status: "LIVE",
        };
    });

    await prisma.channel.createMany({
      data: data,
      skipDuplicates: true
    });

    totalInserted += batch.length;
    console.log(`Inserted batch ${i} to ${i + batch.length} (${totalInserted}/${parsedChannels.length})`);
  }

  console.log("Done! Total inserted:", totalInserted);
}

run().catch(console.error).finally(() => prisma.$disconnect());
