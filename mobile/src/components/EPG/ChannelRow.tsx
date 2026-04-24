import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import ProgramCell from "./ProgramCell";
import { EPGChannel, EPGCell } from "../../types/epg";
import { buildCells } from "../../engine/layoutCalculator";

interface ChannelRowProps {
  channel: EPGChannel;
  cells: any[]; // These are raw programs in this model
  windowStart: Date;
  focusedProgramId?: string | null;
  isFavorite?: boolean;
  isFocused?: boolean;
}

/**
 * 📡 CHANNEL ROW (TiviMate Grade)
 * Optimization: Performs row-level layout calculation within useMemo.
 * Decouples heavy layout processing from the global store for ultra-smooth 60fps scrolling.
 */
function ChannelRow({ channel, cells: programs, windowStart, focusedProgramId, isFavorite, isFocused }: ChannelRowProps) {
  const cells = useMemo(
    () => buildCells(programs, windowStart),
    [programs, windowStart]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
            {channel.logo ? (
            <Image source={{ uri: channel.logo }} style={styles.logo} resizeMode="contain" />
            ) : (
            <View style={[styles.logo, styles.placeholderLogo]}>
                <Text style={styles.placeholderText}>{channel.name[0]}</Text>
            </View>
            )}
            {isFavorite && (
                <View style={styles.favoriteBadge}>
                    <Star size={10} color="#FBBF24" fill="#FBBF24" />
                </View>
            )}
        </View>
        <Text numberOfLines={2} style={[styles.name, isFavorite && { color: "#FBBF24" }]}>{channel.name}</Text>
      </View>

      <View style={styles.timeline}>
        {cells.map((cell) => (
          <ProgramCell 
            key={cell.program.id} 
            cell={cell} 
            isFocused={cell.program.id === focusedProgramId}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  header: {
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#09090b",
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.05)",
  },
  logoContainer: {
    position: "relative",
    width: 32,
    height: 32,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  favoriteBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#09090b",
    borderRadius: 10,
    padding: 2,
  },
  placeholderLogo: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "bold",
  },
  name: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 10,
    flex: 1,
  },
  timeline: {
    flex: 1,
    position: "relative",
  },
});

// 🧠 STAFF LEVEL PERFORMANCE RULE
export default React.memo(ChannelRow, (prev, next) => {
  return (
      prev.cells === next.cells && 
      prev.channel.id === next.channel.id &&
      prev.isFavorite === next.isFavorite &&
      prev.isFocused === next.isFocused &&
      prev.focusedProgramId === next.focusedProgramId
  );
});
