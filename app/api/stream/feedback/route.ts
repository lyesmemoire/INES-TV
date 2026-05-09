export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

/**
 * 📈 FEEDBACK API (Intelligence Collective)
 * 
 * Permet aux utilisateurs de remonter la qualité réelle des flux.
 * - Succès (lecture fluide) : +0.1 au score
 * - Échec (erreur/buffering) : -0.3 au score
 */
export async function POST(req: NextRequest) {
  try {
    const { sourceId, success } = await req.json()

    if (!sourceId) return NextResponse.json({ error: "Missing sourceId" }, { status: 400 })

    const delta = success ? 0.05 : -0.2

    // 🔥 Mise à jour atomique du score en base
    // Utilise une fonction RPC Supabase pour éviter les Race Conditions
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.rpc('update_stream_score', {
      source_id: sourceId,
      delta: delta
    })

    // Fallback si la fonction RPC n'est pas encore créée
    if (error) {
      const { data: current } = await supabase
        .from("stream_sources")
        .select("quality_score")
        .eq("id", sourceId)
        .single()

      const newScore = Math.max(0, Math.min(1, (current?.quality_score || 0.5) + delta))

      await supabase
        .from("stream_sources")
        .update({ quality_score: newScore })
        .eq("id", sourceId)
    }

    return NextResponse.json({ success: true, new_delta: delta })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
