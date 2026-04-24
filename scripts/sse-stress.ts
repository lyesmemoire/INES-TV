import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { EventSource } = require("eventsource");

const CONCURRENCY = 200
const URL = "http://localhost:3000/api/metrics/stream"

let received = 0
let errors = 0

console.log("🚀 Starting SSE Stress Test...")
console.log(`URL: ${URL}`)
console.log(`Concurrency: ${CONCURRENCY}`)

for (let i = 0; i < CONCURRENCY; i++) {
  try {
    const es = new EventSource(`${URL}?api_key=production_stress_test_key`, {
      headers: {
        "x-api-key": "production_stress_test_key",
      },
    })

    es.onmessage = () => {
      received++
    }

    es.onerror = (err: any) => {
      errors++
      if (errors <= 5) console.error("SSE Error:", err.message || err);
    }
  } catch (err: any) {
    errors++
    console.error("Connection Error:", err.message);
  }
}

setTimeout(() => {
  console.log("\n📊 SSE RESULTS")
  console.log("===================")
  console.log("Connections:", CONCURRENCY)
  console.log("Messages received:", received)
  console.log("Errors:", errors)
  process.exit(0)
}, 60_000)
