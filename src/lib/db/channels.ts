import { getSupabaseBrowserClient } from "../supabase/client";

const supabase = getSupabaseBrowserClient();

export async function saveChannels(channels: any[]) {
  const { error } = await supabase.from("channels").insert(
    channels.map((c) => ({
      name: c.name,
      logo: c.logo,
      group: c.group,
      stream_url: c.url,
      is_active: true,
    }))
  );

  if (error) {
    console.error("Insert error:", error);
    throw error;
  }
}
