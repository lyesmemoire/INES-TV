import React from "react";
import { TouchableOpacity, Image, Text, View, StyleSheet } from "react-native";

interface GridItemProps {
  item: { id: string; title: string; thumbnail: string; status?: string };
  onPress: () => void;
}

/**
 * 🖼️ NETFLIX-STYLE GRID ITEM (Phase 50)
 * High-performance card for OTT Dashboard with status badges.
 */
export default function GridItem({ item, onPress }: GridItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {item.status && (
          <Text style={styles.status}>{item.status}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    width: 120,
  },
  thumbnail: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#18181B',
  },
  info: {
    marginTop: 6,
  },
  title: {
    color: "white",
    fontSize: 13,
    fontWeight: '600',
  },
  status: {
    color: "#fbbf24", // gold
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
});
