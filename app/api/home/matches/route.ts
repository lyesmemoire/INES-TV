export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { EditorialService } from "@/src/services/EditorialService";

export async function GET(req: NextRequest) {
  try {
    const locale = req.nextUrl.searchParams.get('locale') || 'en';
    // 🏟️ Dual-Source Featured Matches (Priority: Match DB, Fallback: Hardcoded)
    const featured = await EditorialService.getHeroMatches(locale);
    
    return NextResponse.json({
      status: "ok",
      live: featured,
      upcoming: [], // To be populated via Match table in Phase 2.5
    });
  } catch (error) {
    console.error("[HOME API ERROR] Critical failure in EditorialService:", error);
    
    // 🛡️ ULTRA FAIL-SAFE: Revenir aux données brutes si tout le reste échoue
    return NextResponse.json({
      status: "ok",
      live: [
        {
          id: "fallback-1",
          name: "PSG vs OM",
          thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
          streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          category: "football",
          homeLogo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
          awayLogo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
          score: "2-1",
          viewers: 45000,
          isPremium: false,
          liveStats: { elapsedTime: "LIVE" },
        }
      ],
      upcoming: [],
    });
  }
}

