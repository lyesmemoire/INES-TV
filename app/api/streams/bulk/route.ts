export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { channels, clearExisting } = await req.json();

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json(
        { error: "No channels provided" },
        { status: 400 }
      );
    }

    if (clearExisting) {
      console.log("[API /streams/bulk] Clearing existing channels...");
      const { error: delError } = await supabaseAdmin.from("Channel").delete().neq("id", "dummy_id");
      if (delError) {
        return NextResponse.json({ error: "Failed to clear existing channels: " + delError.message }, { status: 500 });
      }
    }

    // Insert into Channel table (same table the homepage reads from)
    // Process in batches of 50 to avoid payload limits
    const batchSize = 50;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < channels.length; i += batchSize) {
      const batch = channels.slice(i, i + batchSize);

      const { error } = await supabaseAdmin.from("Channel").insert(
        batch.map((ch: any) => ({
          name: ch.name || "Unknown",
          streamUrl: ch.streamUrl || ch.url || "",
          logo: ch.logo || null,
          category: ch.category || "General",
          isActive: ch.isActive ?? true,
          status: ch.status || "LIVE",
          // Note: description if it existed should be added here
        }))
      );

      if (error) {
        console.error(`[API /streams/bulk] Batch ${i} error:`, error.message);
        errors.push(`Batch ${i}: ${error.message}`);
      } else {
        totalInserted += batch.length;
      }
    }

    if (errors.length > 0 && totalInserted === 0) {
      return NextResponse.json(
        { error: errors.join("; "), inserted: 0 },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inserted: totalInserted,
      total: channels.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("[API /streams/bulk] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
