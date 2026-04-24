import { supabase } from "../lib/supabase";

/**
 * Fetches the active target device (TV) for the user.
 * Priority: Last seen Android TV.
 */
export const getActiveTargetDevice = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "ONLINE")
      .order("last_seen", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn("DEVICE-DISCOVERY-FAIL:", error.message);
    return null;
  }
};

/**
 * Sends a command to a specific device.
 */
export const sendRemoteCommand = async (deviceId, command, channelId = null, payload = {}) => {
  try {
    const { error } = await supabase
      .from("devices")
      .update({
        last_command: command,
        last_channel: channelId,
        command_payload: payload,
        updated_at: new Date()
      })
      .eq("id", deviceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("REMOTE-CMD-FAIL:", error.message);
    return false;
  }
};
