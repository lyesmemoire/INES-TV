import { NextRequest, NextResponse } from "next/server"
import { epgData, getChannelEPG, getCurrentProgram, getUpcomingPrograms } from "@/lib/epg-data"

export const dynamic = "force-dynamic"

/**
 * GET /api/epg
 * 
 * Query params:
 *   - channel_id: (optional) filter by channel ID
 *   - current: (optional) "true" to get only the current program
 *   - upcoming: (optional) number of upcoming programs to return
 * 
 * Examples:
 *   GET /api/epg                         → all EPG data
 *   GET /api/epg?channel_id=bein-movies  → EPG for BEIN MOVIES
 *   GET /api/epg?channel_id=bein-movies&current=true → current program only
 *   GET /api/epg?channel_id=bein-movies&upcoming=5   → next 5 programs
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get("channel_id")
    const wantCurrent = searchParams.get("current") === "true"
    const upcomingCount = searchParams.get("upcoming")

    // Return all EPG data
    if (!channelId) {
      return NextResponse.json(
        { status: "success", data: epgData },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      )
    }

    // Channel-specific queries
    const channelEpg = getChannelEPG(channelId)
    if (!channelEpg) {
      return NextResponse.json(
        { status: "error", message: `No EPG data for channel: ${channelId}` },
        { status: 404 }
      )
    }

    // Current program only
    if (wantCurrent) {
      const current = getCurrentProgram(channelId)
      return NextResponse.json(
        {
          status: "success",
          channel: channelEpg.channel_name,
          current: current || null,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      )
    }

    // Upcoming programs
    if (upcomingCount) {
      const upcoming = getUpcomingPrograms(channelId, parseInt(upcomingCount, 10))
      return NextResponse.json(
        {
          status: "success",
          channel: channelEpg.channel_name,
          upcoming,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      )
    }

    // Full channel EPG
    return NextResponse.json(
      { status: "success", data: channelEpg },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.error("EPG API error:", error)
    return NextResponse.json(
      { status: "error", message: "Failed to fetch EPG data" },
      { status: 500 }
    )
  }
}
