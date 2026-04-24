import { supabase } from "../lib/supabase";

// 🔥 Trending
export const getTrending = async () => {
  return supabase
    .from("Channel")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(10);
};

// 📺 Live TV
export const getLive = async () => {
  return supabase
    .from("Channel")
    .select("*")
    .eq("status", "LIVE");
};

// 🎬 Movies
export const getMovies = async () => {
  return supabase
    .from("Movie")
    .select("*");
};

// 📺 Series
export const getSeries = async () => {
  return supabase
    .from("Series")
    .select("*");
};

// 🌍 By category
export const getByCategory = async (category) => {
  return supabase
    .from("Channel")
    .select("*")
    .eq("category", category);
};

// ❤️ Continue Watching
export const getContinueWatching = async (userId) => {
  return supabase
    .from("WatchHistory")
    .select("*, Channel(*)")
    .eq("userId", userId);
};
