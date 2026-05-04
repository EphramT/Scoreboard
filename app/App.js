import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import ShotClockControl from "./components/ShotClockControl";

const DEFAULT_HOST = "192.168.1.100";
const PORT = 8765;

export default function App() {
  const [host, setHost] = useState(DEFAULT_HOST);
  const [connected, setConnected] = useState(false);
  const [clockState, setClockState] = useState({ running: false, time_remaining: 15, duration: 15 });
  const ws = useRef(null);

  const connect = useCallback(() => {
    if (ws.current) ws.current.close();

    const socket = new WebSocket(`ws://${host}:${PORT}`);

    socket.onopen = () => setConnected(true);

    socket.onmessage = (e) => {
      try {
        setClockState(JSON.parse(e.data));
      } catch {}
    };

    socket.onclose = () => {
      setConnected(false);
      ws.current = null;
    };

    socket.onerror = () => socket.close();

    ws.current = socket;
  }, [host]);

  const sendCommand = useCallback((cmd) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ cmd }));
    }
  }, []);

  useEffect(() => () => ws.current?.close(), []);

  const { running, time_remaining, duration } = clockState;
  const urgentColor = time_remaining <= 5 ? "#e53935" : "#ffffff";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <View style={styles.connectionRow}>
        <TextInput
          style={styles.hostInput}
          value={host}
          onChangeText={setHost}
          placeholder="Pi IP address"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />
        <TouchableOpacity style={[styles.connectBtn, connected && styles.connectBtnActive]} onPress={connect}>
          <Text style={styles.connectBtnText}>{connected ? "Connected" : "Connect"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.clockContainer}>
        <Text style={[styles.clockText, { color: urgentColor }]}>
          {time_remaining.toFixed(1)}
        </Text>
        <Text style={styles.durationLabel}>{duration}s mode</Text>
      </View>

      <ShotClockControl onCommand={sendCommand} clockRunning={running} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212", padding: 20 },
  connectionRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  hostInput: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  connectBtn: { backgroundColor: "#333", borderRadius: 8, paddingHorizontal: 16, justifyContent: "center" },
  connectBtnActive: { backgroundColor: "#2e7d32" },
  connectBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  clockContainer: { alignItems: "center", marginVertical: 40 },
  clockText: { fontSize: 96, fontWeight: "700", fontVariant: ["tabular-nums"] },
  durationLabel: { color: "#888", fontSize: 18, marginTop: 4 },
});
