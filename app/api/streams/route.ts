export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { type, url, name } = await req.json();

    if (!url || !name) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("Channel")
      .insert([{ 
        name, 
        streamUrl: url, 
        category: "General", 
        isActive: true, 
        status: "LIVE" 
      }])
      .select()
      .single();

    if (error) {
      console.error("[API /streams] Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stream: data });
  } catch (err: any) {
    console.error("[API /streams] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("Channel")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ streams: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

