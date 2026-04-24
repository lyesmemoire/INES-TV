import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function MatchCard({ match, onPress }) {
  const isLive = match.status === "live";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.competition}>{match.competition}</Text>
        {isLive && (
          <View style={styles.liveBadge}>
             <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={styles.matchRow}>
        <View style={styles.team}>
          <Image source={{ uri: match.home_logo }} style={styles.logo} />
          <Text style={styles.teamName} numberOfLines={1}>{match.home_team}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{match.score_home} - {match.score_away}</Text>
          <Text style={styles.time}>{isLive ? match.match_time : "Bientôt"}</Text>
        </View>

        <View style={styles.team}>
          <Image source={{ uri: match.away_logo }} style={styles.logo} />
          <Text style={styles.teamName} numberOfLines={1}>{match.away_team}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 15,
    width: 280,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  competition: {
    color: "#444",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  liveBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  team: {
    alignItems: "center",
    width: 70,
  },
  logo: {
    width: 32,
    height: 32,
    marginBottom: 5,
    resizeMode: "contain",
  },
  teamName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scoreContainer: {
    alignItems: "center",
  },
  score: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  time: {
    color: "#4F46E5",
    fontSize: 10,
    fontWeight: "900",
  },
});
