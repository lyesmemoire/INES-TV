export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { getChannelsFromDB } from "@/lib/supabase-channels"
import { getCurrentProgram } from "@/lib/epg-data"
import { supabaseAdmin as supabase } from "@/lib/supabase-server"
import { invalidateCache } from "@/lib/streamCache"
import { rateLimit } from "@/lib/ratelimit"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const channels = await getChannelsFromDB()
  const channel = channels.find(c => c.id === params.id)

  if (!channel) {
    return Response.json({ error: "Not found" }, { status: 404 })
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
    return Response.json({ error: "Too many requests" }, { status: 429 })
  }

  // Get current EPG program if available
  const currentProgram = getCurrentProgram(params.id)

  return Response.json({
    url: channel.streamUrl || "",
    type: "hls",
    token: "free-mode",
    channel: {
      id: channel.id,
      name: channel.name,
      category: channel.category,
      logo: channel.logo,
      description: channel.description,
    },
    nowPlaying: currentProgram ? {
      title: currentProgram.title,
      desc: currentProgram.desc,
      start: currentProgram.start_date,
      end: currentProgram.end_date,
    } : null,
  })
}

/**
 * 🗑️ DELETE /api/stream/:id
 *
 * Delete a single stream source (partial delete).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id)

  try {
    // Get the source first to know its channelId (for cache invalidation)
    const { data: source } = await supabase
      .from("LiveSource")
      .select("channelId")
      .eq("id", id)
      .single()

    const { error } = await supabase
      .from("LiveSource")
      .delete()
      .eq("id", id)

    if (error) throw error

    // Invalidate cache for the parent channel
    if (source?.channelId) {
      invalidateCache(`best:${source.channelId}`)
    }

    return Response.json({ success: true, deletedSourceId: id })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
