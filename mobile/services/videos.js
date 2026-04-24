import { supabase } from "../lib/supabase";

export const getVideos = async () => {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
};
