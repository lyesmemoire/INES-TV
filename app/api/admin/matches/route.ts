export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { MatchService } from "@/src/services/MatchService";

/**
 * GET /api/admin/matches
 * Lists all matches for the admin dashboard
 */
export async function GET() {
  try {
    const matches = await MatchService.getMatches();
    return NextResponse.json({
      status: "ok",
      matches
    });
  } catch (error) {
    console.error("[API Admin Matches] Error fetching matches:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/matches
 * Creates a new match
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation minimale
    if (!body.homeTeam || !body.awayTeam || !body.competition || !body.startTime) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields (homeTeam, awayTeam, competition, startTime)" },
        { status: 400 }
      );
    }

    const match = await MatchService.createMatch({
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      competition: body.competition,
      startTime: new Date(body.startTime),
      status: body.status || 'UPCOMING',
      score: body.score,
      homeLogo: body.homeLogo,
      awayLogo: body.awayLogo,
      isFeatured: body.isFeatured || false,
      featuredOrder: body.featuredOrder || null,
    });

    return NextResponse.json({
      status: "ok",
      matchId: match.id,
      message: "Match created successfully",
      match
    });
  } catch (error) {
    console.error("[API Admin Matches] Error creating match:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create match" },
      { status: 500 }
    );
  }
}

