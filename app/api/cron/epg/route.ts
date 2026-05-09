import { fetchEPG } from "@/src/lib/iptv/parseEPG"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

/**
 * ⏰ EPG SYNC CRON (Vercel)
 * 
 * Synchronise les données XMLTV avec la base de données Supabase.
 * Exécuté automatiquement via vercel.json.
 */
export async function GET() {
  const EPG_URL = process.env.EPG_URL || "https://example.com/epg.xml"

  if (!EPG_URL) {
    return NextResponse.json({ error: "Missing EPG_URL env variable" }, { status: 500 })
  }

  try {
    console.log("🚀 Starting EPG Sync from:", EPG_URL)
    const programs = await fetchEPG(EPG_URL)

    // Optimization: Bulk upsert to 'epg_programs'
    const batchSize = 100
    let successCount = 0

    for (let i = 0; i < programs.length; i += batchSize) {
      const batch = programs.slice(i, i + batchSize)
      
      const { error } = await supabase.from("epg_programs").upsert(
        batch.map((p) => ({
          channel_id: p.channel, // Match with channels.id
          title: p.title,
          start_time: p.start,
          end_time: p.stop,
        })),
        { onConflict: 'channel_id, start_time' }
      )

      if (error) {
        console.error("Batch error:", error)
      } else {
        successCount += batch.length
      }
    }

    return NextResponse.json({
      success: true,
      total_found: programs.length,
      synced: successCount,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("Cron EPG sync failed:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
