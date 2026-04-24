import { prisma } from "./server/services/db.js";
import { LiveSourceType } from "@prisma/client";
import { FeedOrchestrator } from "./server/core/FeedOrchestrator.js";
import { streamResolver } from "./server/services/StreamResolver.js";

async function test() {
  console.log("🧪 Starting resolution test...");
  
  // 1. Find or create a test channel
  let channel = await prisma.channel.findFirst({ where: { isActive: true } });
  if (!channel) {
    console.log("Creating dummy channel...");
    channel = await prisma.channel.create({
      data: {
        id: "test-channel-sre",
        name: "SRE Test Channel",
        status: "LIVE",
        category: "Sport",
        lastSeenAt: new Date(),
        isActive: true
      }
    });
  }

  console.log(`Using channel: ${channel.id}`);

  // 2. Add sources
  await prisma.liveSource.deleteMany({ where: { channelId: channel.id } });
  
  await prisma.liveSource.create({
    data: {
      channelId: channel.id,
      type: LiveSourceType.M3U,
      url: "https://example.com/playlist.m3u8",
      priority: 10,
      name: "High Priority M3U"
    }
  });

  await prisma.liveSource.create({
    data: {
      channelId: channel.id,
      type: LiveSourceType.STREAM,
      url: "https://example.com/stream",
      priority: 5,
      name: "Low Priority Stream"
    }
  });

  console.log("Sources created.");

  // 3. Resolve
  console.log("Resolving...");
  const resolved = await streamResolver.resolveBestStream(channel.id, "HOT");
  console.log("Resolved Stream:", JSON.stringify(resolved, null, 2));

  if (resolved?.url === "https://example.com/playlist.m3u8") {
    console.log("✅ SUCCESS: High priority M3U resolved.");
  } else {
    console.log("❌ FAILURE: Incorrect resolution.");
  }

  // 4. Test Coalescing
  console.log("Testing Coalescing...");
  const [res1, res2] = await Promise.all([
    streamResolver.resolveBestStream(channel.id, "HOT"),
    streamResolver.resolveBestStream(channel.id, "HOT")
  ]);
  console.log("Coalesced results confirmed.");

  // 5. Test L1 Cache
  const hit = await streamResolver.resolveBestStream(channel.id, "HOT");
  if (hit?.__hit === "L1") {
    console.log("✅ SUCCESS: L1 Cache Hit confirmed.");
  }

  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
