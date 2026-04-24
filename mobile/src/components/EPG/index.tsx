"use client";

import React, { useState } from "react";
import { View, FlatList, StyleSheet, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useEPG } from "../../hooks/useEPG";
import { useTVRemote } from "../../hooks/useTVRemote";
import ChannelRow from "./ChannelRow";
import ProgramPreview from "./ProgramPreview";

/**
 * Android TV PRO EPG Screen (TiviMate/Netflix Style)
 * Supports 100% Horizontal Synchronized Timeline.
 */
export default function EPGScreen() {
  const { channels, programs } = useEPG();
  const [preview, setPreview] = useState<any>(null);
  const router = useRouter();

  useTVRemote();

  const handlePlay = (channel: any) => {
    router.push(`/player/${channel.id}`); // 🔥 EXPO-ROUTER NAVIGATION
  };

  return (
    <View
      style={styles.container}
      focusable={false}
    >
      <StatusBar hidden />
      
      <FlatList
        data={channels}
        keyExtractor={(item: any) => item.id}
        initialNumToRender={10}
        windowSize={5}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        renderItem={({ item }) => (
          <ChannelRow
            channel={item}
            programs={programs}
            onPlay={handlePlay}
            onPreview={setPreview}
          />
        )}
      />

      {/* TiviMate-style Bottom Overlay */}
      <ProgramPreview program={preview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  listContent: {
    paddingVertical: 20,
    paddingHorizontal: 0,
  }
});
