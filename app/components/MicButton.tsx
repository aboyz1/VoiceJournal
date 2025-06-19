import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  onPress: () => void;
  isRecording?: boolean;
};

const MicButton: React.FC<Props> = ({ onPress, isRecording = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.recordingButton]}
      onPress={onPress}
    >
      <Ionicons name={isRecording ? "stop" : "mic"} size={36} color="#fff" />
    </TouchableOpacity>
  );
};

export default MicButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ff4757",
    padding: 20,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  recordingButton: {
    backgroundColor: "#d63031",
    transform: [{ scale: 1.1 }],
  },
});
