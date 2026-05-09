import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function searchChannels(query: string) {
  const { data, error } = await supabase
    .from("Channel")
    .select("*")
    .textSearch("search_vector", query)

  if (error) {
    console.error("Search error:", error)
    return []
  }

  return data
}
