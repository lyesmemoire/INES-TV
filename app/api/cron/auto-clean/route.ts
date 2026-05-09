import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * ⏰ CRON — AUTO CLEAN ENGINE
 * 
 * 100% deterministic strict deletion logic.
 */
export async function GET() {
  const { data: sources } = await supabaseAdmin
    .from("LiveSource")
    .select("*")

  let removed = 0

  for (const s of sources || []) {
    if (!s.isActive || s.healthScore < 0.3) {
      await supabaseAdmin
        .from("LiveSource")
        .delete()
        .eq("id", s.id)

      removed++
    }
  }

  return NextResponse.json({
    success: true,
    removed
  })
}
