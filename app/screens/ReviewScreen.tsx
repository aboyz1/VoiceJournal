import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Alert,
  TextInput,
} from "react-native";
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Mood } from "../data/schemas";
import { RootStackParamList } from "../navigation/AppNavigator";
import { analyzeEmotionsComprehensively } from "../services/NLPService";
import { getEntry, deleteEntry, createEntry, updateEntry } from "../services/StorageService";
import { showErrorAlert, showSuccessAlert } from "../utils/alertUtils";
import { formatDateTime, formatDuration } from "../utils/dateUtils";
import { ComprehensiveMoodAnalysis, getMoodConfig } from "../utils/moodUtils";
import { isValidText, validateJournalEntry } from "../utils/validationUtils";

type ReviewScreenRouteProp = RouteProp<RootStackParamList, "Review">;

const ReviewScreen = () => {
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [moodAnalysis, setMoodAnalysis] = useState<ComprehensiveMoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);

  // Audio playback state - same as EntryDetailScreen
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const route = useRoute<ReviewScreenRouteProp>();
  const navigation = useNavigation<any>();

  const audioUri = route.params?.audioUri || "";
  const existingEntryId = route.params?.entryId;

  useEffect(() => {
    const loadExistingEntry = async () => {
      if (existingEntryId) {
        setIsLoading(true);
        try {
          const entry = await getEntry(existingEntryId);
          if (entry) {
            setText(entry.text);
            setOriginalText(entry.text);
            setEntryId(entry.id);
            setEntryDate(entry.createdAt);
            analyzeMood(entry.text);
          }
        } catch (error) {
          console.error("Error loading entry:", error);
          showErrorAlert("Error", "Failed to load journal entry");
        } finally {
          setIsLoading(false);
        }
      } else {
        // New entry with transcription
        const initialText = route.params?.transcription || "This is a demo transcription of your audio entry.";
        setText(initialText);
        setOriginalText(initialText);
        analyzeMood(initialText);
      }
    };
    loadExistingEntry();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [existingEntryId, route.params?.transcription]);

  // Audio loading effect - same as EntryDetailScreen
  useEffect(() => {
    if (audioUri) {
      const loadAudio = async () => {
        try {
          const { sound: audioSound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: false }
          );
          
          audioSound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
          setSound(audioSound);
          
          const status = await audioSound.getStatusAsync();
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
          }
        } catch (err) {
          console.error('Audio loading error:', err);
        }
      };

      loadAudio();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  // Playback status update - same as EntryDetailScreen
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

  // Audio controls - same as EntryDetailScreen
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

  const analyzeMood = async (textToAnalyze: string) => {
    if (!isValidText(textToAnalyze)) return;

    try {
      const comprehensiveAnalysis = await analyzeEmotionsComprehensively(textToAnalyze);
      setMoodAnalysis({
        primaryEmotion: {
          emotion: comprehensiveAnalysis.primaryEmotion.emotion,
          confidence: comprehensiveAnalysis.primaryEmotion.confidence,
          intensity: "medium",
          keywords: [],
        },
        summary: comprehensiveAnalysis.summary,
        insights: comprehensiveAnalysis.insights,
        secondaryEmotions: comprehensiveAnalysis.secondaryEmotions,
        overallSentiment: comprehensiveAnalysis.overallSentiment,
        emotionalComplexity: "simple",
      });
    } catch (error) {
      console.error("Mood analysis error:", error);
      setMoodAnalysis({
        primaryEmotion: {
          emotion: "neutral",
          confidence: 0,
          intensity: "medium",
          keywords: [],
        },
        summary: "Unable to analyze emotions at this time.",
        insights: ["Try writing a bit more to get better emotional insights."],
        secondaryEmotions: [],
        overallSentiment: "neutral",
        emotionalComplexity: "simple",
      });
    }
  };

  const handleEdit = () => {
    console.log("[ReviewScreen] Edit button pressed");
    setIsEditing(true);
  };

  const handleSave = async () => {
    console.log("[ReviewScreen] Save button pressed");
    
    if (!moodAnalysis) {
      showErrorAlert("Analysis Error", "Please wait for mood analysis to complete");
      return;
    }

    const validation = validateJournalEntry({
      text: text.trim(),
      audioUri,
      mood: moodAnalysis.primaryEmotion.emotion,
    });

    if (!validation.isValid) {
      showErrorAlert("Validation Error", validation.errors.join("\n"));
      return;
    }

    setIsSaving(true);

    try {
      if (entryId) {
        // Update existing entry
        await updateEntry(entryId, {
          text: text.trim(),
          mood: moodAnalysis.primaryEmotion.emotion,
        });
        showSuccessAlert("Success", "Journal entry updated successfully");
      } else {
        // Create new entry
        const newEntryId = await createEntry({
          audioUri,
          text: text.trim(),
          mood: moodAnalysis.primaryEmotion.emotion,
          duration: route.params?.duration || 0,
        });
        setEntryId(newEntryId);
        showSuccessAlert("Success", "Journal entry saved successfully");
      }

      setOriginalText(text);
      setIsEditing(false);
      
      // Re-analyze mood if text changed
      if (text.trim() !== originalText.trim()) {
        analyzeMood(text.trim());
      }
    } catch (error) {
      console.error("[ReviewScreen] Save error:", error);
      showErrorAlert("Error", "Failed to save journal entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    console.log("[ReviewScreen] Cancel edit");
    setText(originalText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log("[ReviewScreen] Delete button pressed");
    
    if (!entryId) {
      // If this is a new entry (not saved yet), just go back
      Alert.alert(
        "Discard Entry",
        "Are you sure you want to discard this journal entry?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Discard", 
            style: "destructive",
            onPress: () => navigation.goBack()
          }
        ]
      );
      return;
    }

    // For existing entries, delete from database
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
              console.log("[ReviewScreen] Deleting entry:", entryId);
              await deleteEntry(entryId);
              console.log("[ReviewScreen] Entry deleted successfully");
              navigation.goBack();
            } catch (error) {
              console.error("[ReviewScreen] Delete error:", error);
              showErrorAlert("Error", "Failed to delete entry");
            }
          }
        }
      ]
    );
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Debounce mood analysis
    const timeoutId = setTimeout(() => {
      if (newText.trim() !== originalText.trim() && newText.trim().length > 10) {
        analyzeMood(newText.trim());
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  };

  const getMoodDisplayName = (mood: Mood): string => {
    const config = getMoodConfig(mood);
    return config.displayName.charAt(0).toUpperCase() + config.displayName.slice(1);
  };

  const hasUnsavedChanges = text.trim() !== originalText.trim();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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
            onPress={() => {
              if (hasUnsavedChanges && isEditing) {
                Alert.alert(
                  "Unsaved Changes",
                  "You have unsaved changes. Do you want to save before leaving?",
                  [
                    { text: "Discard", onPress: () => navigation.goBack() },
                    { text: "Save", onPress: handleSave },
                    { text: "Cancel", style: "cancel" }
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#0e141b" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Journal Entry</Text>
        </View>

        {/* Date */}
        <Text style={styles.dateText}>
          {formatDateTime(entryDate)}
        </Text>

        {/* Entry Text */}
        {isEditing ? (
          <TextInput
            style={styles.textInput}
            multiline
            value={text}
            onChangeText={handleTextChange}
            placeholder="Enter your journal entry..."
            placeholderTextColor="#4e7097"
            autoFocus
          />
        ) : (
          <Text style={styles.entryText}>
            {text || "No transcription available"}
          </Text>
        )}

        {/* Mood Analysis */}
        <Text style={styles.sectionTitle}>Mood Analysis</Text>
        <View style={styles.moodRow}>
          <Text style={styles.moodLabel}>
            {moodAnalysis ? getMoodDisplayName(moodAnalysis.primaryEmotion.emotion) : "Analyzing..."}
          </Text>
          <Text style={styles.moodPercentage}>
            {moodAnalysis ? `${Math.round(moodAnalysis.primaryEmotion.confidence * 100)}%` : "0%"}
          </Text>
        </View>

        {/* Audio Player Card - Updated with EntryDetailScreen style */}
        {audioUri && (
          <View style={styles.audioCard}>
            <View style={styles.audioCardContent}>
              <View style={styles.audioThumbnail}>
                <Ionicons name="musical-notes" size={24} color="#0e141b" />
              </View>
              <View style={styles.audioInfo}>
                <Text style={styles.audioTitle}>Journal Entry</Text>
                <Text style={styles.audioDate}>
                  {entryDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
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
            
            {/* Audio Progress - Same as EntryDetailScreen */}
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
                  <Text style={styles.timeText}>{formatDuration(position)}</Text>
                  <Text style={styles.timeText}>{formatDuration(duration)}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* AI Insights */}
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Text style={styles.insightsText}>
          {moodAnalysis?.summary || "Your journal entry is being analyzed for emotional insights..."}
        </Text>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.actionsGrid}>
          {isEditing ? (
            <>
              {/* Cancel Button */}
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleCancelEdit}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="close" size={20} color="#0e141b" />
                </View>
                <Text style={styles.actionLabel}>Cancel</Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity 
                style={[styles.actionButton, isSaving && styles.disabledButton]} 
                onPress={handleSave}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                <View style={[styles.actionIcon, styles.saveIcon]}>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                </View>
                <Text style={[styles.actionLabel, styles.saveLabel]}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>

              {/* Delete Button */}
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
            </>
          ) : (
            <>
              {/* Edit Button */}
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="pencil" size={20} color="#0e141b" />
                </View>
                <Text style={styles.actionLabel}>Edit</Text>
              </TouchableOpacity>
              
              {/* Delete Button */}
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

              {/* Save Button (for new entries only) */}
              {!entryId && (
                <TouchableOpacity 
                  style={[styles.actionButton, isSaving && styles.disabledButton]} 
                  onPress={handleSave}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  <View style={[styles.actionIcon, styles.saveIcon]}>
                    <Ionicons name="save" size={20} color="#ffffff" />
                  </View>
                  <Text style={[styles.actionLabel, styles.saveLabel]}>
                    {isSaving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
  } as ViewStyle,
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  
  loadingText: {
    fontSize: 16,
    color: "#4e7097",
  } as TextStyle,
  
  scrollContainer: {
    paddingBottom: 120, // Space for bottom actions
  } as ViewStyle,
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  } as ViewStyle,
  
  backButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  
  screenTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0e141b",
    flex: 1,
    textAlign: "center",
    marginRight: 48, // Offset for back button
  } as TextStyle,
  
  dateText: {
    color: "#4e7097",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
  } as TextStyle,
  
  entryText: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
  } as TextStyle,

  textInput: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e7edf3",
  } as TextStyle,
  
  sectionTitle: {
    color: "#0e141b",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  } as TextStyle,
  
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    minHeight: 56,
  } as ViewStyle,
  
  moodLabel: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  } as TextStyle,
  
  moodPercentage: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
  } as TextStyle,
  
  audioCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  } as ViewStyle,
  
  audioCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#e7edf3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  } as ViewStyle,
  
  audioThumbnail: {
    width: 56,
    height: 56,
    backgroundColor: "#d1d5db",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  
  audioInfo: {
    flex: 1,
  } as ViewStyle,
  
  audioTitle: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  } as TextStyle,
  
  audioDate: {
    color: "#4e7097",
    fontSize: 14,
    fontWeight: "400",
  } as TextStyle,
  
  playButton: {
    width: 40,
    height: 40,
    backgroundColor: "#1978e5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  // Audio progress styles - same as EntryDetailScreen
  progressContainer: {
    backgroundColor: "#e7edf3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    marginHorizontal: 16,
    marginTop: 8,
  } as ViewStyle,

  slider: {
    width: '100%',
    height: 40,
  } as ViewStyle,

  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  } as ViewStyle,

  timeText: {
    fontSize: 12,
    color: '#4e7097',
    fontWeight: '400',
  } as TextStyle,
  
  insightsText: {
    color: "#0e141b",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    paddingBottom: 12,
    paddingTop: 4,
    paddingHorizontal: 16,
  } as TextStyle,
  
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8fafc",
  } as ViewStyle,
  
  actionsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  } as ViewStyle,
  
  actionButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
  } as ViewStyle,
  
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#e7edf3",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,

  saveIcon: {
    backgroundColor: "#1978e5",
  } as ViewStyle,
  
  actionLabel: {
    color: "#0e141b",
    fontSize: 14,
    fontWeight: "500",
  } as TextStyle,

  saveLabel: {
    color: "#1978e5",
    fontWeight: "600",
  } as TextStyle,

  disabledButton: {
    opacity: 0.6,
  } as ViewStyle,
  
  bottomSpacing: {
    height: 20,
    backgroundColor: "#f8fafc",
  } as ViewStyle,
});

export default ReviewScreen;
