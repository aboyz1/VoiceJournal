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
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createEntry, updateEntry, getEntry } from "../services/StorageService";
import { analyzeText } from "../services/NLPService";
import { formatDateTime } from "../utils/dateUtils";
import { getMoodConfig } from "../utils/moodUtils";
import { isValidText, validateJournalEntry } from "../utils/validationUtils";
import { showErrorAlert, showSuccessAlert, showUnsavedChangesAlert } from "../utils/alertUtils";
import { Mood } from "../data/schemas";

type ReviewScreenRouteProp = RouteProp<RootStackParamList, "Review">;

interface MoodData {
  mood: Mood;
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
  
  const audioUri = route.params?.audioUri || '';
  const existingEntryId = route.params?.entryId;

  // Convert mood analysis to UI data using utilities
  const getMoodData = (mood: Mood, confidence: number): MoodData => {
    const config = getMoodConfig(mood);
    return {
      mood,
      confidence,
      description: config.description,
      color: config.color,
      icon: config.icon
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
            setMoodData(getMoodData(entry.mood, 0.95));
          }
        } catch (error) {
          console.error('Error loading entry:', error);
          showErrorAlert('Error', 'Failed to load journal entry');
        } finally {
          setIsLoading(false);
        }
      } else {
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
    if (!isValidText(textToAnalyze)) return;
    
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
    
    const timeoutId = setTimeout(() => {
      if (newText !== originalText) {
        analyzeMood(newText);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  // Handle save functionality
  const handleSave = async () => {
    // Validate entry data
    const validation = validateJournalEntry({
      text: text.trim(),
      audioUri,
      mood: moodData.mood
    });

    if (!validation.isValid) {
      showErrorAlert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setIsSaving(true);
    
    try {
      if (entryId) {
        await updateEntry(entryId, {
          text: text.trim(),
          mood: moodData.mood
        });
        showSuccessAlert('Success', 'Journal entry updated successfully');
      } else {
        const newEntryId = await createEntry({
          audioUri,
          text: text.trim(),
          mood: moodData.mood
        });
        setEntryId(newEntryId);
        showSuccessAlert('Success', 'Journal entry saved successfully');
      }
      
      setOriginalText(text);
      if (isEditing) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      showErrorAlert('Error', 'Failed to save journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setText(originalText);
    setIsEditing(false);
    if (originalText !== text) {
      analyzeMood(originalText);
    }
  };

  // Check if there are unsaved changes
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
        {/* Header with back button and title */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (hasUnsavedChanges && !isEditing) {
                showUnsavedChangesAlert(
                  handleSave,
                  () => navigation.goBack()
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
            {formatDateTime(new Date())}
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
          style={[styles.primaryButton, isSaving && styles.disabledButton]}
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

const styles = StyleSheet.create({
  container: {
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
