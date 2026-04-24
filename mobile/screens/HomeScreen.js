import VideoCard from "../components/VideoCard";
import MatchCard from "../components/MatchCard";
import { useFeed } from "../hooks/useFeed";
import { useIntelligenceWatcher } from "../hooks/useIntelligenceWatcher";
import { usePredictiveEvents } from "../hooks/usePredictiveEvents";
import { useAuth } from "../context/AuthContext";
import { Alert } from "react-native";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { feed, loading, refresh } = useHomeFeed(user?.id);

  // 🧠 UNIFIED ORCHESTRATOR CONSUMER (v14)
  useOrchestratedEvents(user?.id, (action) => {
    switch (action.action_type) {
      case "notification":
        Alert.alert("⚡ MOMENTUM", action.payload.message, [
          { text: "VOIR", onPress: () => console.log("Zap...") },
          { text: "OK" }
        ]);
        break;
      
      case "overlay":
        // Handle mobile overlays if any, or just background sync
        break;

      case "feed_update":
        refresh(); // Instant refresh from orchestrated signal
        break;
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const renderRow = (title, data, isSports = false) => {
    if (!data || data.length === 0) return null;
    
    return (
      <View style={{ marginBottom: 25 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          {title.includes("POUR VOUS") && (
             <View style={styles.aiBadge}>
               <Text style={styles.aiBadgeText}>AI PROFILE</Text>
             </View>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data.map((item) => (
            isSports ? (
              <MatchCard
                key={item.id}
                match={item}
                onPress={() =>
                  item.channels && navigation.navigate("Player", { video: item.channels })
                }
              />
            ) : (
              <VideoCard
                key={item.id || item.channel_id}
                item={item}
                onPress={() =>
                  navigation.navigate("Player", { video: item })
                }
              />
            )
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainHeader}>IntelliFeed OS</Text>
      
      {renderRow("🔥 EN DIRECT - SPORTS", feed?.liveSports, true)}
      
      {/* ⚡ PREDICTIVE RAIL (MOMENTUM) */}
      {renderRow("⚡ ANTICIPATION AI", feed?.predictiveEvents?.map(p => p.sports_events).filter(Boolean), true)}

      {renderRow("📺 POUR VOUS (AI RANKED)", feed?.personalized)}
      
      {renderRow("▶️ REPRENDRE LA LECTURE", feed?.continueWatching)}
      
      {renderRow("🔥 TRENDING", feed?.trending)}
      
      {(!feed || (feed.continueWatching.length === 0 && feed.recommended.length === 0)) && (
        <View style={styles.emptyState}>
           <Text style={styles.emptyText}>Commencez à regarder sur TV ou Mobile pour booster votre flux IA !</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 15,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  mainHeader: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 20,
    marginTop: 10,
    marginLeft: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  aiBadge: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  aiBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#444",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  }
});
