import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";

type ReviewScreenRouteProp = RouteProp<RootStackParamList, "Review">;

const ReviewScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(
    "This is a demo transcription of your audio entry."
  );
  const route = useRoute<ReviewScreenRouteProp>();
  const navigation = useNavigation();
  
  // Add safety check for route params
  const audioUri = route.params?.audioUri || '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header with back button and title */}
        <View style={styles.header}>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Journal Entry</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Date and time section */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>6/19/2025 • 1:32 PM</Text>
        </View>

        {/* Audio player section */}
        <View style={styles.audioPlayer}>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.durationText}>1:23</Text>
        </View>

        {/* Transcription section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              multiline
              value={text}
              onChangeText={setText}
              autoFocus
            />
          ) : (
            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText}>{text}</Text>
            </View>
          )}
        </View>

        {/* Mood analysis section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Analysis</Text>
          <View style={styles.moodContainer}>
            <View style={[styles.moodPill, { backgroundColor: "#FFD700" }]}>
              <Ionicons name="happy" size={16} color="#fff" />
              <Text style={styles.moodText}>HAPPY</Text>
            </View>
            <Text style={styles.moodDescription}>
              Positive sentiment detected
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer with action buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "close" : "create"}
            size={20}
            color="#007AFF"
          />
          <Text style={styles.secondaryButtonText}>
            {isEditing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            if (isEditing) setIsEditing(false);
            // Save functionality here
          }}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "save"}
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isEditing ? "Save Changes" : "Save Entry"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: "#6C757D",
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
    marginRight: 16,
  },
  progressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  durationText: {
    fontSize: 14,
    color: "#6C757D",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  transcriptionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
    minHeight: 150,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  moodText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 6,
  },
  moodDescription: {
    fontSize: 14,
    color: "#6C757D",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ReviewScreen;
