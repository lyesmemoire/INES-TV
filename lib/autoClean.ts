import axios from "axios"
import { supabaseAdmin as supabase } from "@/lib/supabase-server"
import { invalidateCacheByPrefix } from "./streamCache"

/**
 * 🧹 AUTO-CLEAN ENGINE (Rule-Based, No AI)
 *
 * Aligned with Supabase "LiveSource" table schema.
 * Parallel health checks → score update → dead source cleanup → reorder.
 */

const TIMEOUT_MS = 4000
const CONCURRENCY = 20

// ─────────────────────────────────────────
// STREAM TEST
// ─────────────────────────────────────────

async function testStream(url: string): Promise<{
  isActive: boolean
  healthScore: number
}> {
  const start = Date.now()

  try {
    await axios.head(url, {
      timeout: TIMEOUT_MS,
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    const latency = Date.now() - start

    let score = 0.5
    if (latency < 2000) score = 1.0
    else if (latency < 5000) score = 0.6
    else score = 0.3

    return { isActive: true, healthScore: score }
  } catch {
    return { isActive: false, healthScore: 0 }
  }
}

// ─────────────────────────────────────────
// BATCH PROCESSOR (Controlled Concurrency)
// ─────────────────────────────────────────

async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }

  return results
}

// ─────────────────────────────────────────
// MAIN ENGINE
// ─────────────────────────────────────────

export async function autoCleanEngine(): Promise<{
  checked: number
  dead: number
  lowQuality: number
  channelsDisabled: number
}> {
  console.log("🧹 [AutoClean] Engine starting...")

  const { data: sources, error } = await supabase
    .from("LiveSource")
    .select("*")

  if (error || !sources) {
    console.error("❌ [AutoClean] Failed to fetch sources:", error)
    return { checked: 0, dead: 0, lowQuality: 0, channelsDisabled: 0 }
  }

  let dead = 0
  let lowQuality = 0

  // ⚡ PARALLEL HEALTH CHECKS (batched)
  await processBatch(
    sources,
    async (source: any) => {
      const result = await testStream(source.url)

      // Update health data in DB
      await supabase
        .from("LiveSource")
        .update({
          isActive: result.isActive,
          healthScore: result.healthScore,
          lastCheckedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", source.id)

      // Track stats
      if (!result.isActive) {
        dead++
        // Deprioritize dead sources
        await supabase
          .from("LiveSource")
          .update({ priority: -1 })
          .eq("id", source.id)
        console.log(`  ❌ DEAD: ${source.url.substring(0, 80)}...`)
      } else if (result.healthScore < 0.4) {
        lowQuality++
        await supabase
          .from("LiveSource")
          .update({ priority: 0 })
          .eq("id", source.id)
        console.log(`  ⚠️ LOW: ${source.url.substring(0, 80)}...`)
      } else if (result.healthScore >= 0.8) {
        // Fast source → boost priority
        await supabase
          .from("LiveSource")
          .update({ priority: 10 })
          .eq("id", source.id)
      }
    },
    CONCURRENCY
  )

  // 🗑️ Disable channels with zero active sources
  const channelsDisabled = await disableEmptyChannels()

  // 🔄 Reorder all active sources by healthScore
  await reorderSources()

  // 🧹 Flush load balancer cache (stale data after clean)
  invalidateCacheByPrefix("best:")

  console.log(
    `✅ [AutoClean] Done — checked: ${sources.length}, dead: ${dead}, low: ${lowQuality}, channels disabled: ${channelsDisabled}`
  )

  return { checked: sources.length, dead, lowQuality, channelsDisabled }
}

// ─────────────────────────────────────────
// DISABLE EMPTY CHANNELS
// ─────────────────────────────────────────

async function disableEmptyChannels(): Promise<number> {
  const { data: channels } = await supabase
    .from("Channel")
    .select("id")
    .eq("isActive", true)

  let disabled = 0

  for (const ch of channels || []) {
    const { data: activeSources } = await supabase
      .from("LiveSource")
      .select("id")
      .eq("channelId", ch.id)
      .eq("isActive", true)

    if (!activeSources || activeSources.length === 0) {
      await supabase
        .from("Channel")
        .update({ isActive: false })
        .eq("id", ch.id)

      disabled++
      console.log(`  🗑️ Disabled empty channel: ${ch.id}`)
    }
  }

  return disabled
}

// ─────────────────────────────────────────
// REORDER SOURCES BY HEALTH SCORE
// ─────────────────────────────────────────

async function reorderSources(): Promise<void> {
  const { data: sources } = await supabase
    .from("LiveSource")
    .select("id, healthScore, priority, isActive, channelId")
    .eq("isActive", true)
    .order("healthScore", { ascending: false })

  if (!sources) return

  // Group by channel for per-channel priority ordering
  const byChannel = new Map<string, typeof sources>()
  for (const s of sources) {
    const list = byChannel.get(s.channelId) || []
    list.push(s)
    byChannel.set(s.channelId, list)
  }

  for (const [, channelSources] of byChannel) {
    let priority = 10
    for (const s of channelSources) {
      if (s.priority !== priority) {
        await supabase
          .from("LiveSource")
          .update({ priority: Math.max(priority, 1) })
          .eq("id", s.id)
      }
      priority--
    }
  }
}
