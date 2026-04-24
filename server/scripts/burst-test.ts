import Redis from "ioredis";

/**
 * 🚀 BURST TEST (5,000 EVENTS STRESS TEST)
 * Validates Redis Stream ingestion performance under load.
 */

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redis = new Redis(REDIS_URL);

async function burstTest() {
  console.log("\x1b[35m🚀 BURST TEST START\x1b[0m");

  const start = Date.now();
  const pipeline = redis.pipeline();

  for (let i = 0; i < 5000; i++) {
    pipeline.xadd("obs:raw", "*", "event", JSON.stringify({
      type: "TEST_BURST",
      ts: Date.now(),
      payload: { load: "high", index: i }
    }));
  }

  console.log("📨 Executing pipeline...");
  await pipeline.exec();

  const duration = Date.now() - start;
  const len = await redis.xlen("obs:raw");

  console.log(`\x1b[32m✅ Injected 5,000 events\x1b[0m`);
  console.log(`⚡ Time: \x1b[36m${duration}ms\x1b[0m`);
  console.log(`📊 Total Stream Length: \x1b[33m${len}\x1b[0m`);

  if (duration > 2000) {
    console.log("\x1b[33m⚠️ WARNING: Slow Redis write (>2s for 5k events)\x1b[0m");
  } else {
    console.log("\x1b[32m🟢 Redis performance OK\x1b[0m");
  }

  process.exit(0);
}

burstTest().catch(err => {
  console.error("❌ BURST TEST FAILED", err);
  process.exit(1);
});
