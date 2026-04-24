import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Video from "react-native-video";
import { useAuth } from "../context/AuthContext";
import { recordWatchEvent } from "../services/videoEvents";

export default function PlayerScreen({ route }) {
  const { video } = route.params;
  const { user } = useAuth();
  const player = useRef(null);
  const [loading, setLoading] = useState(true);
  
  // Track continuous watch time for AI scoring
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Record final duration when leaving the player
    return () => {
      const durationSeconds = (Date.now() - startTime.current) / 1000;
      if (user && video && durationSeconds > 2) { // 2s threshold matching TV logic
        recordWatchEvent(user.id, video.id || video.channel_id, durationSeconds);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      <Video
        ref={player}
        source={{ uri: video.streamUrl || video.stream_url || "" }}
        style={styles.video}
        resizeMode="contain"
        controls
        onLoad={() => setLoading(false)}
        onError={(e) => console.error("PLAYER-ERROR:", e)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  video: { width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  }
});
