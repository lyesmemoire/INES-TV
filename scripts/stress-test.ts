import fetch from "node-fetch"
import { performance } from "perf_hooks"

const isWarmup = process.argv.includes("--warmup")
const CONCURRENCY = 500
const DURATION_MS = isWarmup ? 10_000 : 60_000
const URL = "http://localhost:3000/api/metrics"

const results: number[] = []
let errors = 0

async function worker(startTime: number) {
  while (Date.now() < startTime + DURATION_MS) {
    const t0 = performance.now()
    try {
      const res = await fetch(URL, {
        headers: {
          "x-api-key": process.env.OPS_API_KEY || "",
        },
      })

      if (!res.ok) {
        errors++
        continue
      }

      await res.json()
      const t1 = performance.now()
      results.push(t1 - t0)
    } catch {
      errors++
    }
  }
}

async function run() {
  const mode = isWarmup ? "🔥 WARMUP" : "🚀 STRESS TEST"
  console.log(`${mode} Starting API Stress Test...`)
  console.log(`Target: ${URL}`)
  console.log(`Concurrency: ${CONCURRENCY}`)
  console.log(`Duration: ${DURATION_MS / 1000}s`)

  const startTime = Date.now()

  await Promise.all(
    Array.from({ length: CONCURRENCY }).map(() => worker(startTime))
  )

  if (isWarmup) {
    console.log("🔥 Warmup complete")
    process.exit(0)
  }

  results.sort((a, b) => a - b)

  const p50 = results[Math.floor(results.length * 0.5)] || 0
  const p95 = results[Math.floor(results.length * 0.95)] || 0
  const p99 = results[Math.floor(results.length * 0.99)] || 0
  const avg = results.length > 0 ? results.reduce((a, b) => a + b, 0) / results.length : 0
  
  const slowRequests = results.filter(r => r > 1000)

  console.log("\n📊 RESULTS")
  console.log("===================")
  console.log("Requests:", results.length)
  console.log("Errors:", errors)
  console.log("Avg latency:", avg.toFixed(2), "ms")
  console.log("p50 latency:", p50.toFixed(2), "ms")
  console.log("p95 latency:", p95.toFixed(2), "ms")
  console.log("p99 latency:", p99.toFixed(2), "ms")
  console.log("Slow requests (>1s):", slowRequests.length)
}

run().catch(err => {
  console.error("Test failed:", err)
  process.exit(1)
})
