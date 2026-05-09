import axios from "axios"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function checkStream(url: string) {
  try {
    const start = Date.now()

    const res = await axios.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 IPTV HealthCheck"
      }
    })

    const time = Date.now() - start
    const isM3U8 = typeof res.data === 'string' && res.data.includes("#EXTM3U")

    return {
      isActive: res.status === 200 && isM3U8,
      response_time: time,
      healthScore: calculateScore(time)
    }

  } catch {
    return {
      isActive: false,
      response_time: 9999,
      healthScore: 0
    }
  }
}

function calculateScore(time: number) {
  if (time < 500) return 1
  if (time < 1000) return 0.8
  if (time < 2000) return 0.6
  return 0.3
}

export async function runHealthCheck() {
  console.log("🚀 Starting Health Check Worker (Ultra strict)...")

  const { data: sources, error } = await supabaseAdmin
    .from("LiveSource")
    .select("id, url")
    .order("lastCheckedAt", { ascending: true, nullsFirst: true })
    .limit(20)

  if (error || !sources) return

  const results = await Promise.all(
    sources.map(async (s) => {
      const result = await checkStream(s.url)
      return {
        id: s.id,
        isActive: result.isActive,
        healthScore: result.healthScore,
        lastCheckedAt: new Date().toISOString()
      }
    })
  )

  for (const res of results) {
    await supabaseAdmin
      .from("LiveSource")
      .update({
        isActive: res.isActive,
        healthScore: res.healthScore,
        lastCheckedAt: res.lastCheckedAt
      })
      .eq("id", res.id)
  }

  console.log(`✅ Health check completed for ${results.length} sources.`)
}
