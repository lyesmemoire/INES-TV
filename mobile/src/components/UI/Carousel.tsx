import React from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import GridItem from "./GridItem";

interface CarouselProps {
  title: string;
  data: any[];
  onItemPress: (item: any) => void;
}

/**
 * 🎞️ OTT CAROUSEL (Phase 50)
 * Horizontal list of channels with category titles.
 */
export default function Carousel({ title, data, onItemPress }: CarouselProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GridItem item={item} onPress={() => onItemPress(item)} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 16,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 8,
  },
});
