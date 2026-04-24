import React, { useEffect } from "react";
import { View, StyleSheet, BackHandler } from "react-native";
import VideoPlayer from "../components/player/VideoPlayer";
import AdsOverlay from "../components/player/AdsOverlay";
import KeyEvent from "react-native-keyevent";

interface PlayerScreenProps {
  route: {
    params: {
      channelId: string;
      token: string;
    };
  };
  navigation: any;
}

/**
 * 📺 PLAYER SCREEN: MOBILE & TV (Phase 48)
 * Entry point for stream playback with remote control integration.
 */
export default function PlayerScreen({ route, navigation }: PlayerScreenProps) {
  const { channelId, token } = route.params;

  useEffect(() => {
    // 1. 🎮 Android TV Remote Control (KeyEvents)
    KeyEvent.onKeyDownListener((keyEvent: any) => {
      // Key codes for standard Android TV remotes
      switch (keyEvent.keyCode) {
        case 23: // OK (Center button)
          console.log("[TV] Play/Pause Toggle triggered");
          break;
        case 4: // BACK (Go back to dashboard)
          console.log("[TV] Exit Player triggered");
          navigation.goBack();
          break;
        case 19: // UP
        case 20: // DOWN
        case 21: // LEFT
        case 22: // RIGHT
            console.log(`[TV] Navigation D-Pad: ${keyEvent.keyCode}`);
            break;
      }
    });

    // 2. Mobile Back Handler
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      KeyEvent.removeKeyDownListener();
      backHandler.remove();
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* The OTT Player with Seamless Rotation */}
      <VideoPlayer channelId={channelId} token={token} />
      
      {/* Floating Ads Overlay (Pre-roll / Mid-roll) */}
      <AdsOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  }
});
