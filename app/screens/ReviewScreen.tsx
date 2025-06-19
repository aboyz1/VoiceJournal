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
  ViewStyle,
  TextStyle,
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { createEntry, updateEntry, getEntry } from "../services/StorageService";
import { analyzeText } from "../services/NLPService";
import { formatDateTime } from "../utils/dateUtils";
import { getMoodConfig } from "../utils/moodUtils";
import { isValidText, validateJournalEntry } from "../utils/validationUtils";
import { showErrorAlert, showSuccessAlert, showUnsavedChangesAlert } from "../utils/alertUtils";
import { Mood } from "../data/schemas";
import { theme } from "../theme/theme";

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
    color: theme.colors.textTertiary,
    icon: "help-circle"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  
  const route = useRoute<ReviewScreenRouteProp>();
  const navigation = useNavigation();
  
  const audioUri = route.params?.audioUri || '';
  const existingEntryId = route.params?.entryId;

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

  const handleTextChange = (newText: string) => {
    setText(newText);
    
    const timeoutId = setTimeout(() => {
      if (newText !== originalText) {
        analyzeMood(newText);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleSave = async () => {
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

  const handleCancelEdit = () => {
    setText(originalText);
    setIsEditing(false);
    if (originalText !== text) {
      analyzeMood(originalText);
    }
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
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Journal Entry</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {formatDateTime(new Date())}
          </Text>
        </View>

        <View style={styles.audioPlayer}>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={24} color={theme.colors.surface} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.durationText}>1:23</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput as TextStyle}
              multiline
              value={text}
              onChangeText={handleTextChange}
              autoFocus
              placeholder="Enter your journal entry..."
              placeholderTextColor={theme.colors.textDisabled}
            />
          ) : (
            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText}>
                {text || "No transcription available"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Analysis</Text>
          <View style={styles.moodContainer}>
            <View style={[styles.moodPill, { backgroundColor: moodData.color }]}>
              <Ionicons name={moodData.icon as any} size={16} color={theme.colors.surface} />
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
            color={theme.colors.secondary}
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
            color={theme.colors.surface}
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
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textTertiary,
  } as TextStyle,
  scrollContainer: {
    padding: theme.spacing.base,
    paddingBottom: 80,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  backButton: {
    padding: theme.spacing.sm,
  } as ViewStyle,
  screenTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  } as TextStyle,
  dateContainer: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  } as TextStyle,
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.shadows.base.shadowColor,
    shadowOffset: theme.shadows.base.shadowOffset,
    shadowOpacity: theme.shadows.base.shadowOpacity,
    shadowRadius: theme.shadows.base.shadowRadius,
    elevation: theme.shadows.base.elevation,
  } as ViewStyle,
  playButton: {
    backgroundColor: theme.colors.secondary,
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.base,
  } as ViewStyle,
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.xs,
    marginRight: theme.spacing.base,
  } as ViewStyle,
  progressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xs,
  } as ViewStyle,
  durationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  } as TextStyle,
  section: {
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  transcriptionBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    shadowColor: theme.shadows.base.shadowColor,
    shadowOffset: theme.shadows.base.shadowOffset,
    shadowOpacity: theme.shadows.base.shadowOpacity,
    shadowRadius: theme.shadows.base.shadowRadius,
    elevation: theme.shadows.base.elevation,
    minHeight: 100,
  } as ViewStyle,
  transcriptionText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.fontSize.xl,
    color: theme.colors.textSecondary,
  } as TextStyle,
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.fontSize.xl,
    color: theme.colors.textSecondary,
    minHeight: 150,
    textAlignVertical: "top",
    shadowColor: theme.shadows.base.shadowColor,
    shadowOffset: theme.shadows.base.shadowOffset,
    shadowOpacity: theme.shadows.base.shadowOpacity,
    shadowRadius: theme.shadows.base.shadowRadius,
    elevation: theme.shadows.base.elevation,
  } as ViewStyle,
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  moodPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
  } as ViewStyle,
  moodText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.xs,
    marginLeft: theme.spacing.xs,
  } as TextStyle,
    moodDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  } as TextStyle,
  confidenceText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    fontStyle: "italic",
    marginTop: theme.spacing.xs,
  } as TextStyle,
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.base,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  } as ViewStyle,
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.sm,
  } as ViewStyle,
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  disabledButton: {
    backgroundColor: theme.colors.processing,
    opacity: 0.6,
  } as ViewStyle,
  buttonText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
    marginLeft: theme.spacing.sm,
  } as TextStyle,
  secondaryButtonText: {
    color: theme.colors.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
    marginLeft: theme.spacing.sm,
  } as TextStyle,
});

export default ReviewScreen;
