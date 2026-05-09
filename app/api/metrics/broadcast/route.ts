export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server"
import { getCurrentMetrics, getActiveSessions, getAllStreamHealth } from "@/lib/analytics"
import { supabaseAdmin as supabase } from "@/lib/supabase-server"

/**
 * 🛰️ METRICS BROADCASTER (Enterprise Grade)
 * 
 * Runs via Vercel Cron. Pushes metrics + clean engine stats + QoE to Supabase Realtime.
 */
export async function GET(req: NextRequest) {
  try {
    const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString()

    const [metrics, sessions, streamHealth, { data: sources }, { data: qoe }] = await Promise.all([
      getCurrentMetrics(),
      getActiveSessions(),
      getAllStreamHealth(),
      supabase.from("LiveSource").select("isActive, healthScore"),
      supabase.from("QoeEvent").select("*").gte("createdAt", sixtySecondsAgo),
    ])

    // Clean Engine Stats
    let aliveSources = 0
    let deadSources = 0
    let lowQuality = 0

    sources?.forEach((s) => {
      if (!s.isActive) deadSources++
      else {
        aliveSources++
        if (s.healthScore < 0.4) lowQuality++
      }
    })

    // QoE Stats
    const buffering = qoe?.filter(e => e.eventType === "buffer_start").length || 0
    const errors = qoe?.filter(e => e.eventType === "error").length || 0
    const freezes = qoe?.filter(e => e.eventType === "freeze_detected").length || 0

    const payload = {
      ...metrics,
      sessionCount: sessions.length,
      streamHealth: streamHealth.map((s: any) => ({
        channelId: s.channelId,
        status: s.status,
        viewers: s.viewers,
      })),
      cleanEngine: {
        totalSources: sources?.length || 0,
        aliveSources,
        deadSources,
        lowQuality,
      },
      qoe: {
        buffering,
        errors,
        freezes
      },
      timestamp: Date.now(),
    }

    // 🔥 PUSH TO SUPABASE REALTIME
    const status = await supabase.channel("sre-metrics").send({
      type: "broadcast",
      event: "metrics-update",
      payload,
    })

    if (status !== 'ok') {
      throw new Error(`Broadcast failed with status: ${status}`)
    }

    return NextResponse.json({ success: true, broadcasted: payload.timestamp })
  } catch (error: any) {
    console.error("[BROADCAST ERROR]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
