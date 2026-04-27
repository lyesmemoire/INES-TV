import { createClient } from "redis"

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

client.connect().catch(() => {
  console.warn("Redis fallback mode (memory-like behavior)")
})

export default client
