export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { rateLimit } from "@/lib/ratelimit"

export async function GET(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const { channelId } = params

    if (!channelId) {
      return NextResponse.json({ error: "Missing channel_id" }, { status: 400 })
    }

    // 🛡️ STREAM ABUSE / HOTLINK PROTECTION
    const forwardedFor = req.headers.get("x-forwarded-for")
    let ip = req.headers.get("cf-connecting-ip") 
            || (forwardedFor ? forwardedFor.split(',')[0].trim() : null)
            || req.headers.get("x-real-ip") 
            || "unknown"
            
    const ipRegex = /^[0-9a-fA-F:.]+$/
    if (!ipRegex.test(ip)) ip = 'unknown'
            
    if (!rateLimit(ip)) {
      console.warn(`[RATE LIMIT] Stream abuse detected from IP: ${ip}`)
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const country = req.headers.get("x-vercel-ip-country") || "XX"

    const { data, error } = await supabaseAdmin
      .from("LiveSource")
      .select("*")
      .eq("channelId", channelId)
      .eq("isActive", true)

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: "No sources available" }, { status: 404 })
    }

    // 🎯 SCORE ENGINE
    const scored = data.map((s) => {
      let score = s.healthScore || 0.5

      // GEO BOOST
      if (s.url && s.url.includes(country.toLowerCase())) score += 0.2

      // PRIORITY BOOST
      score += (s.priority || 0) * 0.05

      return { ...s, score }
    })

    // 🧠 SORT
    const sorted = scored.sort((a, b) => b.score - a.score)

    // 🔥 POOL TOP 3 (load balancing)
    const pool = sorted.slice(0, 3)

    // 🎲 RANDOM DISTRIBUTION (avoid overload)
    const selected = pool[Math.floor(Math.random() * pool.length)]

    return NextResponse.json({
      primary: selected,
      fallback: sorted.filter(s => s.id !== selected.id).slice(0, 5)
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
