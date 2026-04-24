"use client";

import React from 'react';
import { View, Text, Image, StyleSheet } from "react-native";

export default function ProgramPreview({ program }: any) {
  if (!program) return null;

  return (
    <View
      pointerEvents="none"
      style={styles.container}
    >
      <Image
        source={{ uri: program.image }}
        style={styles.image}
      />

      <View style={styles.details}>
        <Text style={styles.title}>
          {program.title}
        </Text>
        <Text style={styles.desc}>
          {program.desc}
        </Text>
        <Text style={styles.timeLine}>
            {new Date(program.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' - '}
            {new Date(program.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    elevation: 20,
  },
  image: {
    width: 160,
    height: 100,
    borderRadius: 10,
    marginRight: 20,
    backgroundColor: '#333',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  desc: {
    color: "#a1a1aa",
    fontSize: 14,
    lineHeight: 20,
  },
  timeLine: {
      color: "#10b981",
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 8,
  }
});
