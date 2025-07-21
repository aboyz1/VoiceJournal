import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { JournalEntry } from "../data/schemas";
import { RootStackParamList } from "../navigation/AppNavigator";
import { startRecording, stopRecording } from "../services/AudioService";
import { transcribeAudio } from "../services/STTService";
import { getAllEntries } from "../services/StorageService";
import { getRelativeTime } from "../utils/dateUtils";
import { getMoodConfig } from "../utils/moodUtils";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "processing"
  >("idle");
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);

  const navigation = useNavigation<HomeScreenNavigationProp>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRecentEntries();
  }, []);

  // Add focus listener to reload entries when returning to home screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadRecentEntries();
    });

    return unsubscribe;
  }, [navigation]);

  const loadRecentEntries = async () => {
    try {
      const entries = await getAllEntries();
      setRecentEntries(entries.slice(0, 5)); // Get 5 most recent entries
    } catch (error) {
      console.error("Error loading recent entries:", error);
    }
  };

  const startRecordingSession = async () => {
    setRecordingState("recording");
    await startRecording();
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000) as unknown as NodeJS.Timeout;
  };

  const transcribeWithTimeout = async (
    audioUri: string,
    timeoutMs: number = 30000
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error("Transcription timeout - service took too long to respond")
        );
      }, timeoutMs);

      transcribeAudio(audioUri)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };

  const stopRecordingSession = async () => {
    console.log("[HomeScreen] Stopping recording session...");
    setRecordingState("processing");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      console.log("[HomeScreen] Getting audio URI...");
      const uri = await stopRecording();
      console.log("[HomeScreen] Audio URI received:", uri);

      if (uri) {
        try {
          console.log("[HomeScreen] Starting transcription...");
          const transcription = await transcribeWithTimeout(uri, 30000);

          console.log(
            "[HomeScreen] Transcription completed, navigating to Review..."
          );
          navigation.navigate("Review", {
            audioUri: uri,
            transcription: transcription,
            duration: recordingTime,
          });
        } catch (transcriptionError) {
          console.error(
            "[HomeScreen] Transcription error:",
            transcriptionError
          );

          const errorMessage =
            transcriptionError instanceof Error
              ? transcriptionError.message
              : "Unknown transcription error";

          console.log(
            "[HomeScreen] Navigating to Review with error message..."
          );
          navigation.navigate("Review", {
            audioUri: uri,
            transcription: `Transcription failed: ${errorMessage}. Please edit manually.`,
            duration: recordingTime,
          });
        }
      } else {
        console.error("[HomeScreen] No audio URI received");
        throw new Error("No audio file was created");
      }
    } catch (error) {
      console.error("[HomeScreen] Recording stop error:", error);
      alert(
        "Recording Error: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      console.log("[HomeScreen] Resetting recording state...");
      setRecordingTime(0);
      setRecordingState("idle");
      setIsRecording(false);
    }
  };

  const onRecordPress = async () => {
    if (recordingState === "processing") return;

    if (isRecording) {
      await stopRecordingSession();
    } else {
      await startRecordingSession();
    }
    setIsRecording(!isRecording);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEntryPress = (entry: JournalEntry) => {
    console.log("[HomeScreen] Entry pressed:", entry.id);
    navigation.navigate("EntryDetail", { entryId: entry.id });
  };

  const renderEntryCard = (entry: JournalEntry, index: number) => {
    const moodConfig = getMoodConfig(entry.mood);

    return (
      <TouchableOpacity
        key={entry.id}
        style={styles.entryCard}
        onPress={() => handleEntryPress(entry)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.entryThumbnail, { backgroundColor: moodConfig.color }]}
        >
          <Ionicons name={moodConfig.icon as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.entryInfo}>
          <Text style={styles.entryTitle} numberOfLines={1}>
            {entry.text.length > 20
              ? entry.text.substring(0, 20) + "..."
              : entry.text}
          </Text>
          <Text style={styles.entryTime}>
            {getRelativeTime(entry.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMoodTrendChart = () => {
    // Mock data for demonstration
    const moodPercentage = 75;
    const trendChange = "+10%";

    return (
      <View style={styles.moodTrendCard}>
        <Text style={styles.cardTitle}>Mood Trend</Text>
        <Text style={styles.moodPercentage}>{moodPercentage}%</Text>
        <View style={styles.trendInfo}>
          <Text style={styles.trendPeriod}>Last 7 Days</Text>
          <Text style={styles.trendChange}>{trendChange}</Text>
        </View>

        {/* Simple mock chart - replace with actual chart library */}
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>📈 Mood Chart</Text>
            <Text style={styles.chartSubtext}>Chart visualization here</Text>
          </View>
          <View style={styles.chartLabels}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Text key={day} style={styles.dayLabel}>
                {day}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderInsightCard = () => {
    return (
      <View style={styles.insightCard}>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>Positive Shift</Text>
          <Text style={styles.insightText}>
            Your mood has shown a positive shift over the past week. Keep up the
            great work!
          </Text>
        </View>
        <View style={styles.insightImage}>
          <Ionicons name="trending-up" size={32} color="#07883b" />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>VoiceJournal</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#0e141b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Recent Entries Section */}
        <Text style={styles.sectionTitle}>Recent Entries</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.entriesScroll}
          contentContainerStyle={styles.entriesContainer}
        >
          {recentEntries.length > 0 ? (
            recentEntries.map((entry, index) => renderEntryCard(entry, index))
          ) : (
            <View style={styles.noEntriesCard}>
              <Ionicons name="journal-outline" size={32} color="#4e7097" />
              <Text style={styles.noEntriesText}>No entries yet</Text>
            </View>
          )}
        </ScrollView>

        {/* Record Button */}
        <View style={styles.recordButtonContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              recordingState === "processing" && styles.recordButtonProcessing,
            ]}
            onPress={onRecordPress}
            activeOpacity={0.8}
          >
            {recordingState === "processing" ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <>
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={20}
                  color="#ffffff"
                />
                <Text style={styles.recordButtonText}>
                  {isRecording ? formatTime(recordingTime) : "Record"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Mood Trend Section */}
        <Text style={styles.sectionTitle}>Mood Trend</Text>
        {renderMoodTrendChart()}

        {/* Recent Insights Section */}
        <Text style={styles.sectionTitle}>Recent Insights</Text>
        {renderInsightCard()}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  } as ViewStyle,

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
    backgroundColor: "#f8fafc",
  } as ViewStyle,

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0e141b",
    flex: 1,
    textAlign: "center",
    paddingLeft: 48, // Offset for settings button
  } as TextStyle,

  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  // Scroll View
  scrollView: {
    flex: 1,
  } as ViewStyle,

  // Section Styles
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0e141b",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  } as TextStyle,

  // Recent Entries Styles
  entriesScroll: {
    paddingLeft: 16,
  } as ViewStyle,

  entriesContainer: {
    paddingRight: 16,
    gap: 12,
  } as ViewStyle,

  entryCard: {
    width: 160,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  entryThumbnail: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,

  entryInfo: {
    gap: 4,
  } as ViewStyle,

  entryTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0e141b",
  } as TextStyle,

  entryTime: {
    fontSize: 14,
    color: "#4e7097",
  } as TextStyle,

  noEntriesCard: {
    width: 160,
    aspectRatio: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  noEntriesText: {
    fontSize: 14,
    color: "#4e7097",
    textAlign: "center",
  } as TextStyle,

  // Record Button Styles
  recordButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 20,
  } as ViewStyle,

  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1978e5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    justifyContent: "center",
  } as ViewStyle,

  recordButtonActive: {
    backgroundColor: "#dc2626",
  } as ViewStyle,

  recordButtonProcessing: {
    backgroundColor: "#6b7280",
  } as ViewStyle,

  recordButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  } as TextStyle,

  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  } as ViewStyle,

  processingText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  } as TextStyle,

  // Mood Trend Styles
  moodTrendCard: {
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#d0dbe7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0e141b",
    marginBottom: 8,
  } as TextStyle,

  moodPercentage: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0e141b",
    marginBottom: 8,
  } as TextStyle,

  trendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  } as ViewStyle,

  trendPeriod: {
    fontSize: 16,
    color: "#4e7097",
  } as TextStyle,

  trendChange: {
    fontSize: 16,
    fontWeight: "500",
    color: "#07883b",
  } as TextStyle,

  chartContainer: {
    minHeight: 180,
    gap: 16,
  } as ViewStyle,

  chartPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 20,
  } as ViewStyle,

  chartText: {
    fontSize: 18,
    marginBottom: 4,
  } as TextStyle,

  chartSubtext: {
    fontSize: 14,
    color: "#4e7097",
  } as TextStyle,

  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
  } as ViewStyle,

  dayLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4e7097",
  } as TextStyle,

  // Insight Card Styles
  insightCard: {
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  insightContent: {
    flex: 2,
    gap: 4,
  } as ViewStyle,

  insightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0e141b",
  } as TextStyle,

  insightText: {
    fontSize: 14,
    color: "#4e7097",
    lineHeight: 20,
  } as TextStyle,

  insightImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    aspectRatio: 1,
  } as ViewStyle,

  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e7edf3",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  } as ViewStyle,

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  } as ViewStyle,

  bottomPadding: {
    height: 40,
  } as ViewStyle,
});

export default HomeScreen;
