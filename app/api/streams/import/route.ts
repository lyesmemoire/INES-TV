export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server"
import { parseM3U } from "@/lib/iptv/parseM3U"
import { normalizeChannels } from "@/lib/iptv/normalize"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    let channelsRaw: any[] = []

    // =====================
    // M3U URL
    // =====================
    if (body.m3uUrl) {
      const res = await fetch(body.m3uUrl)
      if (!res.ok) throw new Error(`Failed to fetch M3U: ${res.statusText}`)
      const text = await res.text()
      channelsRaw = parseM3U(text)
    }

    // =====================
    // M3U CONTENT (UPLOAD)
    // =====================
    if (body.m3uContent) {
      channelsRaw = parseM3U(body.m3uContent)
    }

    // =====================
    // SOCIAL LINKS (MANUAL)
    // =====================
    if (body.fbUrl) {
      channelsRaw.push({
        name: "Facebook Live Stream",
        url: body.fbUrl,
        group: "Social",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
      })
    }

    if (body.ytUrl) {
      channelsRaw.push({
        name: "YouTube Live Stream",
        url: body.ytUrl,
        group: "Social",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
      })
    }


    if (!channelsRaw.length) {
      return NextResponse.json({ error: "No channels found" }, { status: 400 })
    }

    // =====================
    // NORMALIZE
    // =====================
    const { channels, streams } = normalizeChannels(
      channelsRaw,
      "m3u8"
    )

    // =====================
    // INSERT CHANNELS & STREAMS
    // =====================
    // Using Prisma for robust schema alignment
    const { prisma } = await import("@/lib/prisma");
    
    // Batch upsert Channels
    for (const ch of channels) {
      await prisma.channel.upsert({
        where: { id: ch.id },
        update: { 
          name: ch.name, 
          logo: ch.logo, 
          category: ch.category 
        },
        create: { 
          id: ch.id, 
          name: ch.name, 
          logo: ch.logo, 
          category: ch.category 
        }
      });
    }

    // Batch insert Streams (avoiding exact duplicates)
    for (const st of streams) {
      const existing = await prisma.stream.findFirst({
        where: { url: st.url, channelId: st.channel_id }
      });
      
      if (!existing) {
        await prisma.stream.create({
          data: {
            channelId: st.channel_id,
            url: st.url,
            type: st.type,
            priority: st.priority,
            status: "UNKNOWN"
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      channels: channels.length,
      streams: streams.length
    })
  } catch (error: any) {
    console.error("[IMPORT API ERROR]:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
