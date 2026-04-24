"use client";

import React, { useState } from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function ProgramBlock({
  program,
  onPress,
  onFocus: externalOnFocus,
  scale = 3,
}: any) {
  const [focused, setFocused] = useState(false);

  const duration =
    (new Date(program.end).getTime() -
      new Date(program.start).getTime()) /
    60000;

  const isLive =
    new Date(program.start) <= new Date() &&
    new Date(program.end) >= new Date();

  return (
    <Pressable
      onPress={() => onPress(program)}
      onFocus={() => {
        setFocused(true);
        externalOnFocus?.(); // 🔥 FIX
      }}
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={isLive}
      style={[
        styles.container,
        {
          width: duration * scale,
          backgroundColor: focused ? "#10b981" : "#18181b",
          transform: [{ scale: focused ? 1.1 : 1 }],
          borderWidth: focused ? 2 : 0,
          borderColor: "#10b981",
        }
      ]}
    >
      <Text numberOfLines={1} style={styles.title}>
        {program.title}
      </Text>
      {isLive && focused && (
          <Text style={styles.liveIndicator}>EN DIRECT</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 6,
    padding: 10,
    borderRadius: 10,
    height: 70,
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: 'bold',
  },
  liveIndicator: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  }
});
