import { supabase } from "@/src/lib/supabase"
import { IPTVChannel } from "@/src/lib/iptv/parseM3U"

export async function saveChannels(channels: IPTVChannel[]) {
  const batchSize = 500

  for (let i = 0; i < channels.length; i += batchSize) {
    const batch = channels.slice(i, i + batchSize)

    const { error } = await supabase.from("channels").upsert(
      batch.map((c) => ({
        id: c.id,
        name: c.name,
        url: c.url,
        logo: c.logo,
        group_name: c.group,
        tvg_id: c.tvgId,
      })),
      { onConflict: "url" }
    )

    if (error) {
      console.error("Error saving batch:", error)
      throw error
    }
  }
}
