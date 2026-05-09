export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { MatchService } from "@/src/services/MatchService";

/**
 * GET /api/admin/matches/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const match = await MatchService.getMatchById(params.id);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "ok", match });
  } catch (error) {
    console.error("[API Admin Match] Error fetching match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/matches/[id]
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const match = await MatchService.updateMatch(params.id, body);
    return NextResponse.json({ status: "ok", match });
  } catch (error) {
    console.error("[API Admin Match] Error updating match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/matches/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await MatchService.deleteMatch(params.id);
    return NextResponse.json({ status: "ok", message: "Match deleted" });
  } catch (error) {
    console.error("[API Admin Match] Error deleting match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
