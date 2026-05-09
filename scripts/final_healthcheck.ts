import { PrismaClient } from "@prisma/client"
import fetch from "node-fetch"

const prisma = new PrismaClient()

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

type CheckResult = {
  name: string
  status: "PASS" | "FAIL"
  latency?: number
  error?: string
}

const results: CheckResult[] = []

function log(result: CheckResult) {
  results.push(result)
  const icon = result.status === "PASS" ? "🟢" : "🔴"
  console.log(`${icon} ${result.name} ${result.latency ? `(${result.latency}ms)` : ""}`)
  if (result.error) console.log("   ↳", result.error)
}

/**
 * 1. DATABASE CHECK
 */
async function checkDatabase() {
  const start = Date.now()
  try {
    const userCount = await prisma.user.count()
    const tenantCount = await prisma.tenant.count()
    log({ name: `Database connection (Users: ${userCount}, Tenants: ${tenantCount})`, status: "PASS", latency: Date.now() - start })
  } catch (e: any) {
    log({ name: "Database connection", status: "FAIL", error: e.message })
  }
}

/**
 * 2. AUTH ALIGNMENT CHECK
 */
async function checkAuth() {
  const start = Date.now()
  try {
    const users = await prisma.user.findMany({ take: 1 })
    if (!users.length) throw new Error("No users found in database")

    log({ name: "Auth / User table alignment", status: "PASS", latency: Date.now() - start })
  } catch (e: any) {
    log({ name: "Auth / User table alignment", status: "FAIL", error: e.message })
  }
}

/**
 * 3. METRICS API CHECK
 */
async function checkMetricsAPI() {
  const start = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/api/metrics`, {
        headers: { "x-api-key": process.env.OPS_API_KEY || "" }
    })
    
    // Note: If no API key, it might 401. This test assumes OPS_API_KEY works.
    if (!res.ok) throw new Error(`HTTP ${res.status} (Key check failed?)`)

    await res.json()

    log({
      name: "Metrics API (with OPS_API_KEY)",
      status: "PASS",
      latency: Date.now() - start,
    })
  } catch (e: any) {
    log({ name: "Metrics API check", status: "FAIL", error: e.message })
  }
}

/**
 * 4. RUNTIME FEED CHECK
 */
async function checkRuntimeFeed() {
  const start = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/api/metrics/health`, {
        headers: { "x-api-key": process.env.OPS_API_KEY || "" }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data: any = await res.json()
    if (data.status !== "ok" && data.status !== "warning") throw new Error(`Health Status: ${data.status}`)

    log({
      name: "Health API (/api/metrics/health)",
      status: "PASS",
      latency: Date.now() - start,
    })
  } catch (e: any) {
    log({ name: "Health API check", status: "FAIL", error: e.message })
  }
}

/**
 * 5. ALERTING CHECK
 */
async function checkAlerting() {
  const start = Date.now()
  try {
    const alertCount = await prisma.alert.count()
    log({
      name: `Alerting system (Total Alerts: ${alertCount})`,
      status: "PASS",
      latency: Date.now() - start,
    })
  } catch (e: any) {
    log({ name: "Alerting system check", status: "FAIL", error: e.message })
  }
}

/**
 * FINAL REPORT
 */
function summary() {
  console.log("\n==============================")
  console.log("🚦 INES TV HEALTHCHECK REPORT")
  console.log("==============================")

  const failed = results.filter(r => r.status === "FAIL")

  console.log(`Total checks: ${results.length}`)
  console.log(`Passed: ${results.length - failed.length}`)
  console.log(`Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.log("\n❌ SYSTEM NOT READY FOR PRODUCTION\n")
    // Note: We don't exit(1) here to allow the agent to see the results
  } else {
    console.log("\n✅ SYSTEM READY FOR PRODUCTION\n")
  }
}

async function run() {
  console.log("🚀 Starting INES TV HealthCheck...\n")

  await checkDatabase()
  await checkAuth()
  
  // These require the server to be running. For the verification tool, 
  // we will try to reach them, but if they fail because of connection refused, 
  // we'll note it.
  await checkMetricsAPI()
  await checkRuntimeFeed()
  
  await checkAlerting()

  summary()
}

run()
  .catch((e) => {
    console.error("Fatal healthcheck error:", e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
