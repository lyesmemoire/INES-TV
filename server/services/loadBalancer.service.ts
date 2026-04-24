// server/services/loadBalancer.service.ts

import crypto from "crypto"
import { redis } from "./redis.service"

export type Source = {
  id: string
  url: string
  priority: number
  maxUsers: number
}

// ─────────────────────────────────────────
// STATE (REDIS BACKED)
// ─────────────────────────────────────────

type Session = {
  sessionId: string
  userId: string
  sourceId: string
  lastSeen: number
}

const SESSION_TTL = 120 // 2 minutes

// ─────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────

export async function createSession(userId: string, sourceId: string) {
  const sessionId = crypto.randomUUID()

  // 1. Store the main session data
  await redis.set(
    `session:${sessionId}`,
    { userId, sourceId, lastSeen: Date.now() },
    { ex: SESSION_TTL }
  )

  // 2. Index the session for the user (Set) - O(1) scalability
  await redis.sadd(`user_sessions:${userId}`, sessionId)

  // 3. Increment the source load
  await redis.incr(`load:${sourceId}`)

  return sessionId
}

export async function heartbeat(sessionId: string) {
  const session = (await redis.get(`session:${sessionId}`)) as Session | null
  if (!session) return

  // Update lastSeen and refresh TTL
  await redis.set(
    `session:${sessionId}`,
    { ...session, lastSeen: Date.now() },
    { ex: SESSION_TTL }
  )
}

export async function releaseSession(sessionId: string) {
  const session = (await redis.get(`session:${sessionId}`)) as Session | null
  if (!session) return

  const { userId, sourceId } = session

  // 1. Cleanup session
  await redis.del(`session:${sessionId}`)
  
  // 2. Remove from user index
  await redis.srem(`user_sessions:${userId}`, sessionId)

  // 3. Decrement source load
  await redis.decr(`load:${sourceId}`)
}

// ─────────────────────────────────────────
// LOAD BALANCER
// ─────────────────────────────────────────

export async function pickBestSource(sources: Source[]) {
  const scoredSources = await Promise.all(
    sources.map(async (s) => {
      // 🏥 Check Health from Distributed Map
      const isHealthy = ((await redis.hget("health_map", s.id)) as boolean | null) ?? true
      
      // 📈 Check Load from Redis Counter
      const currentLoad = ((await redis.get(`load:${s.id}`)) as number | null) ?? 0
      
      const maxUsers = s.maxUsers || 1000
      const score = isHealthy ? (currentLoad / maxUsers) : 2.0 // Penalize dead sources
      
      return { ...s, score }
    })
  )

  // Sort by score (load %) then priority
  scoredSources.sort((a, b) => a.score - b.score || a.priority - b.priority)

  return scoredSources[0] ?? sources[0]
}

// ─────────────────────────────────────────
// HEALTH CHECK ENGINE (Distributed)
// ─────────────────────────────────────────

async function ping(url: string) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000)

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "StreamPerf-Engine/3.0 (Distributed)" }
    })

    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

export function startHealthCheck(sources: Source[]) {
  console.log(`[HealthCheck] Distributed Monitoring of ${sources.length} sources...`)
  
  setInterval(async () => {
    for (const s of sources) {
      const ok = await ping(s.url)
      // Update global health map in Redis
      await redis.hset("health_map", { [s.id]: ok })
    }
  }, 15000)
}

// ─────────────────────────────────────────
// DEBUG / NOC
// ─────────────────────────────────────────

// ─── ENGINE METRICS (REDIS) ─────────────────

export async function getEngineMetrics() {
  const loadKeys = await redis.keys("load:*")
  const sessionKeys = await redis.keys("session:*")

  let totalLoad = 0
  const loads: Record<string, number> = {}

  for (const key of loadKeys) {
    const sourceId = key.replace("load:", "")
    const value = Number(await redis.get(key) || 0)
    loads[sourceId] = value
    totalLoad += value
  }

  // sample sessions (safe cap)
  const sampleSessions: any[] = []
  for (const key of sessionKeys.slice(0, 50)) {
    const raw = await redis.get(key)
    if (raw) {
      try {
        sampleSessions.push(JSON.parse(raw as string))
      } catch {}
    }
  }

  return {
    loads,
    totalLoad,
    activeSources: loadKeys.length,
    activeSessions: sessionKeys.length,
    sampleSessions
  }
}

// ✅ SAFE ALIAS (anti crash legacy)
export const getInternalState = getEngineMetrics

import { scoreNode } from "./scoring.service";
import { predictFailure } from "./predict.service";
import { shouldScaleUp } from "./autoscale.service";

// ─────────────────────────────────────────
// SMART GLOBAL LOAD BALANCER & SYNC
// ─────────────────────────────────────────

export async function getBestNode(region: string) {
  const nodes = JSON.parse(await redis.get("nodes") || "[]");

  // sort by score (load + latency)
  return nodes
    .filter((n: any) => n.region === region && !predictFailure(n))
    .sort((a: any, b: any) => scoreNode(a) - scoreNode(b))[0];
}

// Node Heartbeat (VPS syncing)
setInterval(async () => {
  if (!process.env.NODE_ID) return;
  const currentLoad = ((await redis.get(`load:total`)) as number | null) ?? 0;
  await redis.set(
    `node:${process.env.NODE_ID}`,
    JSON.stringify({
      region: process.env.REGION || "EU",
      load: currentLoad,
      updatedAt: Date.now(),
      maxLoad: 1000,
      latency: 50
    }),
    "EX", 20
  );
}, 5000);

// Self Healing System
setInterval(async () => {
  const nodes = await redis.keys("node:*");
  for (const key of nodes) {
    const raw = await redis.get(key);
    if (raw) {
      const node = JSON.parse(raw as string);
      if (Date.now() - node.updatedAt > 15000) {
        await redis.del(key); // 💀 node dead
      }
    }
  }
}, 15000);

// Auto Scale Local Cron
setInterval(async () => {
  const shouldScale = await shouldScaleUp();

  if (shouldScale) {
    console.log("⚡ SCALE TRIGGER (manual VPS spin needed)");
  }
}, 10000);
