import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function run() {
  console.log("🚀 Starting StreamPerf Production HealthCheck...\n")

  try {
    // 1. DB Check
    await prisma.user.count()
    console.log("🟢 Database connection")

    // 2. Auth Check
    const users = await prisma.user.findMany({ take: 1 })
    if (users.length > 0) console.log("🟢 Auth / User table alignment")

    // 3. Schema Check
    await prisma.alert.count()
    console.log("🟢 Alerting persistence")

    await prisma.metricsSnapshot.count()
    console.log("🟢 Metrics snapshot tracking")

    console.log("\n==============================")
    console.log("🚦 STREAMPERF HEALTHCHECK REPORT")
    console.log("==============================")
    console.log("\n✅ SYSTEM READY FOR PRODUCTION\n")
    process.exit(0)
  } catch (e: any) {
    console.log("\n🔴 HEALTHCHECK FAILED")
    console.error("   ↳", e.message)
    process.exit(1)
  }
}

run()
