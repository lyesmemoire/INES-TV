export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { channel_id, event_type, value } = body

    if (!channel_id || !event_type) {
      return Response.json({ error: "Invalid payload" }, { status: 400 })
    }

    await supabaseAdmin.from("QoeEvent").insert({
      channelId: channel_id,
      eventType: event_type,
      value: value || 0
    })

    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
