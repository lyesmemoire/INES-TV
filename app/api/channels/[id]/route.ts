import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase-server"
import { invalidateCache } from "@/lib/streamCache"

/**
 * 🗑️ DELETE /api/channels/:id
 *
 * Full channel deletion (cascade deletes LiveSource via FK).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id)

  try {
    // Clean up all related entities before deleting the channel
    // to prevent Foreign Key constraint violations
    await supabase.from("LiveSource").delete().eq("channelId", id)
    await supabase.from("Stream").delete().eq("channelId", id)
    await supabase.from("Program").delete().eq("channelId", id)
    await supabase.from("FavoriteChannel").delete().eq("channelId", id)
    await supabase.from("WatchHistory").delete().eq("channelId", id)
    await supabase.from("StreamEvent").delete().eq("channelId", id)
    await supabase.from("FeaturedMatch").delete().eq("channelId", id)
    await supabase.from("StreamSessionLive").delete().eq("channelId", id)
    await supabase.from("QoeEvent").delete().eq("channelId", id)
    // Extra safety:
    await supabase.from("FreeStream").delete().eq("channelId", id)
    await supabase.from("FreeLiveSource").delete().eq("channelId", id)
    await supabase.from("Match").delete().eq("externalId", id) // just in case
    
    // Then delete the channel
    const { error } = await supabase
      .from("Channel")
      .delete()
      .eq("id", id)

    if (error) throw error

    // Invalidate cache for this channel
    invalidateCache(`best:${id}`)

    return NextResponse.json({ success: true, deletedId: id })
  } catch (err: any) {
    console.error("[DELETE Channel] Error:", err.message)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
