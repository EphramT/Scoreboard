import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ShotClockControl({ onCommand, clockRunning }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Btn label="Start" onPress={() => onCommand("start")} disabled={clockRunning} />
        <Btn label="Pause" onPress={() => onCommand("pause")} disabled={!clockRunning} />
      </View>
      <View style={styles.row}>
        <Btn label="Reset" onPress={() => onCommand("reset")} />
        <Btn label="Continue" onPress={() => onCommand("continue")} />
      </View>
      <View style={styles.row}>
        <Btn label="Switch 15 / 10" onPress={() => onCommand("switch")} wide />
      </View>
    </View>
  );
}

function Btn({ label, onPress, disabled = false, wide = false }) {
  return (
    <TouchableOpacity
      style={[styles.btn, wide && styles.btnWide, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: "row", justifyContent: "center", gap: 12 },
  btn: {
    backgroundColor: "#1a73e8",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 130,
    alignItems: "center",
  },
  btnWide: { minWidth: 280 },
  btnDisabled: { backgroundColor: "#555" },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
