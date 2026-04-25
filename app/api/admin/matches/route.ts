import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // TODO: Sauvegarder dans Prisma/Supabase
    console.log("[API] Creating match:", data);

    // Mock response
    return NextResponse.json({
      status: "ok",
      matchId: Date.now().toString(),
      message: "Match created successfully",
    });
  } catch (error) {
    console.error("[API] Error creating match:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create match" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // TODO: Récupérer depuis BDD
  // Mock data for testing the list page
  return NextResponse.json({
    status: "ok",
    matches: [
      {
        id: "1",
        title: "PSG vs Marseille",
        category: "football",
        status: "LIVE",
        viewers: 15400,
      },
      {
        id: "2",
        title: "Real Madrid vs Barcelona",
        category: "football",
        status: "UPCOMING",
        viewers: 0,
      },
    ],
  });
}
