import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { analyzeText, Mood } from "../services/NLPService";
import { transcribeAudio } from "../services/STTService";

type ReviewScreenRouteProp = RouteProp<RootStackParamList, "Review">;

type Entry = {
  id: string;
  audioUri: string;
  text: string;
  mood: Mood;
  date: Date;
  isEditing: boolean;
};

const ReviewScreen = () => {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the audioUri from navigation params
  const route = useRoute<ReviewScreenRouteProp>();
  const { audioUri } = route.params;

  useEffect(() => {
    const processRecording = async () => {
      if (audioUri) {
        await processNewRecording(audioUri);
      }
    };

    processRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUri]);

  const processNewRecording = async (audioUri: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Transcribe audio
      const transcription = await transcribeAudio(audioUri);

      // Step 2: Analyze text
      const analysis = await analyzeText(transcription.text);

      // Create new entry
      setEntry({
        id: Date.now().toString(),
        audioUri,
        text: transcription.text,
        mood: analysis.mood,
        date: new Date(),
        isEditing: false,
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!entry) return;

    // Save to database (to be implemented)
    console.log("Saving entry:", entry);
    setEntry({
      ...entry,
      isEditing: false,
    });
  };

  const handleEdit = () => {
    if (!entry) return;
    setEntry({
      ...entry,
      isEditing: true,
    });
  };

  const handleTextChange = (text: string) => {
    if (!entry) return;
    setEntry({
      ...entry,
      text,
    });
  };

  const getMoodColor = (mood: Mood): string => {
    const moodColors = {
      happy: "#4CAF50",
      sad: "#2196F3",
      angry: "#F44336",
      neutral: "#9E9E9E",
      excited: "#FFC107",
      calm: "#673AB7",
    };
    return moodColors[mood];
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff4757" />
        <Text style={styles.statusText}>Processing your journal entry...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Ionicons name="warning" size={48} color="#ff4757" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => entry && processNewRecording(entry.audioUri)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text>No entry to review</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {entry.date.toLocaleDateString()} • {entry.date.toLocaleTimeString()}
        </Text>
        <View
          style={[
            styles.moodPill,
            { backgroundColor: getMoodColor(entry.mood) },
          ]}
        >
          <Text style={styles.moodText}>{entry.mood.toUpperCase()}</Text>
        </View>
      </View>

      {entry.isEditing ? (
        <TextInput
          style={[styles.textInput, styles.editableText]}
          multiline
          value={entry.text}
          onChangeText={handleTextChange}
          autoFocus
        />
      ) : (
        <Text style={styles.text}>{entry.text}</Text>
      )}

      <View style={styles.buttonContainer}>
        {entry.isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save" size={24} color="white" />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create" size={24} color="white" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    color: "#6c757d",
    fontSize: 14,
  },
  moodPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  moodText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#212529",
    marginBottom: 20,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    color: "#212529",
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    minHeight: 150,
  },
  editableText: {
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4757",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
  statusText: {
    marginTop: 20,
    color: "#6c757d",
  },
  errorText: {
    marginTop: 20,
    color: "#dc3545",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#ff4757",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ReviewScreen;
