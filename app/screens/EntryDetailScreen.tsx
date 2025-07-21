import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Audio, AVPlaybackStatus } from "expo-av";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { JournalEntry } from "../data/schemas";
import { RootStackParamList } from "../navigation/AppNavigator";
import { deleteEntry, getEntry } from "../services/StorageService";
import { showErrorAlert } from "../utils/alertUtils";
import { formatDateTime, formatDuration } from "../utils/dateUtils";
import { getMoodConfig } from "../utils/moodUtils";

type EntryDetailRouteProp = RouteProp<RootStackParamList, "EntryDetail">;

const EntryDetailScreen = () => {
  const route = useRoute<EntryDetailRouteProp>();
  const navigation = useNavigation<any>();
  const { entryId } = route.params;

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const loadedEntry = await getEntry(entryId);
        setEntry(loadedEntry);
      } catch (err) {
        setError("Failed to load journal entry");
        showErrorAlert("Error", "Failed to load journal entry");
      } finally {
        setLoading(false);
      }
    };

    loadEntry();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [entryId]);

  useEffect(() => {
    if (entry?.audioUri) {
      const loadAudio = async () => {
        try {
          const { sound: audioSound } = await Audio.Sound.createAsync(
            { uri: entry.audioUri },
            { shouldPlay: false }
          );

          audioSound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
          setSound(audioSound);

          const status = await audioSound.getStatusAsync();
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
          }
        } catch (err) {
          console.error("Audio loading error:", err);
        }
      };

      loadAudio();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [entry?.audioUri]);

  const updatePlaybackStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      if (status.durationMillis) {
        setDuration(status.durationMillis);
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSliderValueChange = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
    setPosition(value);
  };

  const handleDelete = () => {
    console.log("[EntryDetailScreen] Delete button pressed");

    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("[EntryDetailScreen] Deleting entry:", entryId);
              await deleteEntry(entryId);
              console.log("[EntryDetailScreen] Entry deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("[EntryDetailScreen] Delete error:", error);
              showErrorAlert("Error", "Failed to delete entry");
            }
          },
        },
      ]
    );
  };

  const getMoodDisplayName = (mood: string): string => {
    const config = getMoodConfig(mood as any);
    return (
      config.displayName.charAt(0).toUpperCase() + config.displayName.slice(1)
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Entry not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#0e141b" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Journal Entry</Text>
        </View>

        {/* Date */}
        <Text style={styles.dateText}>{formatDateTime(entry.createdAt)}</Text>

        {/* Entry Text */}
        <Text style={styles.entryText}>
          {entry.text || "No transcription available"}
        </Text>

        {/* Mood Analysis */}
        <Text style={styles.sectionTitle}>Mood Analysis</Text>
        <View style={styles.moodRow}>
          <Text style={styles.moodLabel}>{getMoodDisplayName(entry.mood)}</Text>
          <Text style={styles.moodPercentage}>100%</Text>
        </View>

        {/* Audio Player Card */}
        {entry.audioUri && (
          <View style={styles.audioCard}>
            <View style={styles.audioCardContent}>
              <View style={styles.audioThumbnail}>
                <Ionicons name="musical-notes" size={24} color="#0e141b" />
              </View>
              <View style={styles.audioInfo}>
                <Text style={styles.audioTitle}>Journal Entry</Text>
                <Text style={styles.audioDate}>
                  {entry.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
                disabled={!sound}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color="#f8fafc"
                />
              </TouchableOpacity>
            </View>

            {/* Audio Progress */}
            {sound && (
              <View style={styles.progressContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onSlidingComplete={handleSliderValueChange}
                  minimumTrackTintColor="#1978e5"
                  maximumTrackTintColor="#e7edf3"
                  thumbTintColor="#1978e5"
                  disabled={!sound}
                />

                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatDuration(position)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatDuration(duration)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* AI Insights */}
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Text style={styles.insightsText}>
          This journal entry reflects your emotional state and thoughts from
          this moment in time.
        </Text>
      </ScrollView>

      {/* Bottom Actions - Only Delete Button */}
      <View style={styles.bottomActions}>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="trash-outline" size={20} color="#0e141b" />
            </View>
            <Text style={styles.actionLabel}>Delete</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacing} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#4e7097",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  errorText: {
    fontSize: 16,
    color: "#dc2626",
    marginTop: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#4e7097",
  },

  scrollContainer: {
    paddingBottom: 120, // Space for bottom actions
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },

  backButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  screenTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0e141b",
    flex: 1,
    textAlign: "center",
    marginRight: 48, // Offset for back button
  },

  dateText: {
    color: "#4e7097",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
  },

  entryText: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    color: "#0e141b",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },

  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    minHeight: 56,
  },

  moodLabel: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },

  moodPercentage: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
  },

  audioCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  audioCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#e7edf3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  audioThumbnail: {
    width: 56,
    height: 56,
    backgroundColor: "#d1d5db",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  audioInfo: {
    flex: 1,
  },

  audioTitle: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  audioDate: {
    color: "#4e7097",
    fontSize: 14,
    fontWeight: "400",
  },

  playButton: {
    width: 40,
    height: 40,
    backgroundColor: "#1978e5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Audio progress styles
  progressContainer: {
    backgroundColor: "#e7edf3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },

  slider: {
    width: "100%",
    height: 40,
  },

  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  timeText: {
    fontSize: 12,
    color: "#4e7097",
    fontWeight: "400",
  },

  insightsText: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
  },

  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8fafc",
  },

  actionsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: "center", // Center the single delete button
  },

  actionButton: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 20, // Add horizontal padding for better touch area
  },

  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#e7edf3",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  actionLabel: {
    color: "#0e141b",
    fontSize: 14,
    fontWeight: "500",
  },

  bottomSpacing: {
    height: 20,
    backgroundColor: "#f8fafc",
  },
});
export default EntryDetailScreen;
