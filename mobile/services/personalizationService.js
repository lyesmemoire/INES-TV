import { supabase } from "../lib/supabase";

/**
 * Fetches user favorite teams.
 */
export const getUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_favorite_teams")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("FAVORITES-FETCH-FAIL:", error.message);
    return [];
  }
};

/**
 * Adds a team to user favorites.
 */
export const addFavoriteTeam = async (userId, teamName) => {
  try {
    const { error } = await supabase
      .from("user_favorite_teams")
      .insert({ user_id: userId, team_name: teamName });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("FAVORITE-ADD-FAIL:", error.message);
    return false;
  }
};
