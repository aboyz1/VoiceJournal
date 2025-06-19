import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createEntry, updateEntry, getEntry } from "../services/StorageService";
import { analyzeText } from "../services/NLPService";

type ReviewScreenRouteProp = RouteProp<RootStackParamList, "Review">;

interface MoodData {
  mood: string;
  confidence: number;
  description: string;
  color: string;
  icon: string;
}

const ReviewScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [moodData, setMoodData] = useState<MoodData>({
    mood: "neutral",
    confidence: 0,
    description: "Analyzing...",
    color: "#6C757D",
    icon: "help-circle"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  
  const route = useRoute<ReviewScreenRouteProp>();
  const navigation = useNavigation();
  
  // Add safety check for route params
  const audioUri = route.params?.audioUri || '';
  const existingEntryId = route.params?.entryId;

  // Map mood to UI properties
  const getMoodData = (mood: string, confidence: number): MoodData => {
    const moodMap: Record<string, Omit<MoodData, 'confidence'>> = {
      happy: {
        mood: "happy",
        description: "Positive sentiment detected",
        color: "#FFD700",
        icon: "happy"
      },
      sad: {
        mood: "sad", 
        description: "Negative sentiment detected",
        color: "#FF6B6B",
        icon: "sad"
      },
      angry: {
        mood: "angry",
        description: "Frustrated sentiment detected", 
        color: "#FF4757",
        icon: "flame"
      },
      anxious: {
        mood: "anxious",
        description: "Worried sentiment detected",
        color: "#FFA502", 
        icon: "alert-circle"
      },
      calm: {
        mood: "calm",
        description: "Peaceful sentiment detected",
        color: "#70A1FF",
        icon: "leaf"
      },
      neutral: {
        mood: "neutral",
        description: "Neutral sentiment detected",
        color: "#6C757D",
        icon: "remove-circle"
      }
    };

    return {
      ...moodMap[mood] || moodMap.neutral,
      confidence
    };
  };

  // Load existing entry if editing
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
            setMoodData(getMoodData(entry.mood, 0.95)); // Assume high confidence for existing
          }
        } catch (error) {
          console.error('Error loading entry:', error);
          Alert.alert('Error', 'Failed to load journal entry');
        } finally {
          setIsLoading(false);
        }
      } else {
        // New entry - set demo text and analyze
        const demoText = "This is a demo transcription of your audio entry.";
        setText(demoText);
        setOriginalText(demoText);
        analyzeMood(demoText);
      }
    };

    loadExistingEntry();
  }, [existingEntryId]);

  // Analyze mood when text changes
  const analyzeMood = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    
    try {
      const analysis = await analyzeText(textToAnalyze);
      setMoodData(getMoodData(analysis.mood, analysis.confidence));
    } catch (error) {
      console.error('Mood analysis error:', error);
      setMoodData(getMoodData("neutral", 0));
    }
  };

  // Handle text changes with debounced mood analysis
  const handleTextChange = (newText: string) => {
    setText(newText);
    
    // Debounce mood analysis
    const timeoutId = setTimeout(() => {
      if (newText !== originalText) {
        analyzeMood(newText);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  // Handle save functionality
  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please add some text before saving');
      return;
    }

    setIsSaving(true);
    
    try {
      if (entryId) {
        // Update existing entry
        await updateEntry(entryId, {
          text: text.trim(),
          mood: moodData.mood
        });
        Alert.alert('Success', 'Journal entry updated successfully');
      } else {
        // Create new entry
        const newEntryId = await createEntry({
          audioUri,
          text: text.trim(),
          mood: moodData.mood
        });
        setEntryId(newEntryId);
        Alert.alert('Success', 'Journal entry saved successfully');
      }
      
      setOriginalText(text);
      if (isEditing) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setText(originalText);
    setIsEditing(false);
    // Restore original mood analysis
    if (originalText !== text) {
      analyzeMood(originalText);
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = text.trim() !== originalText.trim();

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' • ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
        {/* Header with back button and title */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (hasUnsavedChanges && !isEditing) {
                Alert.alert(
                  'Unsaved Changes',
                  'You have unsaved changes. Do you want to save before leaving?',
                  [
                    { text: 'Discard', onPress: () => navigation.goBack() },
                    { text: 'Save', onPress: handleSave },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Journal Entry</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Date and time section */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {formatDate(new Date())}
          </Text>
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
              onChangeText={handleTextChange}
              autoFocus
              placeholder="Enter your journal entry..."
            />
          ) : (
            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText}>
                {text || "No transcription available"}
              </Text>
            </View>
          )}
        </View>

        {/* Mood analysis section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Analysis</Text>
          <View style={styles.moodContainer}>
            <View style={[styles.moodPill, { backgroundColor: moodData.color }]}>
              <Ionicons name={moodData.icon as any} size={16} color="#fff" />
              <Text style={styles.moodText}>{moodData.mood.toUpperCase()}</Text>
            </View>
            <Text style={styles.moodDescription}>
              {moodData.description}
            </Text>
          </View>
          {moodData.confidence > 0 && (
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(moodData.confidence * 100)}%
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Footer with action buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            if (isEditing) {
              handleCancelEdit();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isSaving}
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
          style={[styles.primaryButton, isSaving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "save"}
            size={20}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Entry"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
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
    minHeight: 100,
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
    marginBottom: 8,
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
  confidenceText: {
    fontSize: 12,
    color: "#6C757D",
    fontStyle: "italic",
    marginTop: 4,
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
  disabledButton: {
    backgroundColor: "#6C757D",
    opacity: 0.6,
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
