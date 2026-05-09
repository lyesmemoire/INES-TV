import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getChannelsFromDB } from "@/lib/supabase-channels"
import slugify from "slugify"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const channels = await getChannelsFromDB()
    
    return NextResponse.json(channels, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Channels API error:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, category, logo, streamUrl } = body

    if (!name || !streamUrl) {
      return NextResponse.json({ error: "Name and Stream URL are required" }, { status: 400 })
    }

    const id = slugify(name, { lower: true, strict: true })

    // Create channel and source in a transaction
    const channel = await prisma.$transaction(async (tx) => {
      const newChannel = await tx.channel.create({
        data: {
          id,
          name,
          category: category || "General",
          logo: logo || null,
          isActive: true,
        }
      })

      await tx.liveSource.create({
        data: {
          channelId: newChannel.id,
          url: streamUrl,
          type: "STREAM",
          isActive: true,
          priority: 1
        }
      })

      return newChannel
    })

    return NextResponse.json({ success: true, channel })
  } catch (error: any) {
    console.error("Create channel error:", error)
    return NextResponse.json(
      { error: "Failed to create channel", details: error.message },
      { status: 500 }
    )
  }
}

import { supabaseAdmin as supabase } from "@/lib/supabase-server"
import { invalidateCache } from "@/lib/streamCache"

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing channel ID" }, { status: 400 })
    }

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
    await supabase.from("Match").delete().eq("externalId", id)
    
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
