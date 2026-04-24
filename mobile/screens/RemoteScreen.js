import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle, RotateCcw, Volume2, VolumeX, Tv } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { getActiveTargetDevice, sendRemoteCommand } from "../services/remoteService";

export default function RemoteScreen() {
  const { user } = useAuth();
  const [targetDevice, setTargetDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getActiveTargetDevice(user.id).then(device => {
        setTargetDevice(device);
        setLoading(false);
      });
    }
  }, [user]);

  const handleCommand = async (cmd, payload = {}) => {
    if (!targetDevice) return;
    await sendRemoteCommand(targetDevice.id, cmd, null, payload);
  };

  if (loading) return <View style={styles.darkContainer}><ActivityIndicator color="#6366F1" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Tv color={targetDevice ? "#6366F1" : "#444"} size={20} />
        <Text style={styles.headerTitle}>
          {targetDevice ? `Connecté: ${targetDevice.model}` : "Aucune TV détectée"}
        </Text>
      </View>

      {/* D-PAD Area */}
      <View style={styles.padContainer}>
        <View style={styles.dpad}>
          <TouchableOpacity 
            style={[styles.padBtn, styles.up]} 
            onPress={() => handleCommand("key_event", { key: "KEYCODE_DPAD_UP" })}
          >
            <ChevronUp color="#fff" size={32} />
          </TouchableOpacity>
          
          <View style={styles.midRow}>
            <TouchableOpacity 
              style={styles.padBtn} 
              onPress={() => handleCommand("key_event", { key: "KEYCODE_DPAD_LEFT" })}
            >
              <ChevronLeft color="#fff" size={32} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.centerBtn} 
              onPress={() => handleCommand("key_event", { key: "KEYCODE_DPAD_CENTER" })}
            >
              <Circle color="#fff" fill="#fff" size={24} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.padBtn} 
              onPress={() => handleCommand("key_event", { key: "KEYCODE_DPAD_RIGHT" })}
            >
              <ChevronRight color="#fff" size={32} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.padBtn, styles.down]} 
            onPress={() => handleCommand("key_event", { key: "KEYCODE_DPAD_DOWN" })}
          >
            <ChevronDown color="#fff" size={32} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Control Rows */}
      <View style={styles.controlsGrid}>
        <View style={styles.controlRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleCommand("volume_down")}>
                <VolumeX color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => handleCommand("volume_up")}>
                <Volume2 color="#fff" />
                <Text style={styles.btnText}>Volume</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.controlRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleCommand("key_event", { key: "KEYCODE_BACK" })}>
                <RotateCcw color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: "#EF4444" }]} 
                onPress={() => handleCommand("zap_next")}
            >
                <Text style={styles.btnText}>ZAPPING +</Text>
            </TouchableOpacity>
        </View>
      </View>

      {targetDevice && (
        <View style={styles.statusFooter}>
           <Text style={styles.footerText}>ID: {targetDevice.id.slice(0, 8)}... (REALTIME CLOUD ACTIVE)</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070709" },
  darkContainer: { flex: 1, backgroundColor: "#070709", justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  headerTitle: { color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 0.5 },
  padContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  dpad: {
    width: 240,
    height: 240,
    backgroundColor: "#111115",
    borderRadius: 120,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  midRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
  },
  padBtn: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBtn: {
    width: 70,
    height: 70,
    backgroundColor: "#6366F1",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  controlsGrid: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
    justifyContent: "center",
  },
  controlRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    height: 60,
    backgroundColor: "#1a1a24",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  secondaryBtn: {
    width: 60,
    height: 60,
    backgroundColor: "#111115",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 13, textTransform: "uppercase" },
  statusFooter: {
    padding: 24,
    alignItems: "center",
  },
  footerText: { color: "#444", fontSize: 10, fontWeight: "bold", fontMono: true }
});
