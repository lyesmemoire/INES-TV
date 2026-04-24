import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Focusable from "./Focusable";

export default function VideoCard({ item, onPress }) {
  return (
    <Focusable onPress={onPress} style={styles.card}>
      <Image source={{ uri: item.thumbnail }} style={styles.image} />
      <Text style={styles.title}>{item.name || item.title}</Text>
    </Focusable>
  );
}

const styles = StyleSheet.create({
  card: { margin: 10, width: 200 },
  image: { width: "100%", height: 120, borderRadius: 8 },
  title: { color: "#fff", marginTop: 5 },
});
