import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import EntryCard from "../components/EntryCard";
import { initDatabase } from "../data/Database";
import { JournalEntry } from "../data/schemas";
import { RootStackParamList } from "../navigation/AppNavigator";
import { getAllEntries } from "../services/StorageService";
import { theme } from "../theme/theme";
import { showErrorAlert } from "../utils/alertUtils";

type JournalScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const JournalScreen = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<JournalScreenNavigationProp>();

  useEffect(() => {
    const initializeAndLoadEntries = async () => {
      try {
        await initDatabase();
        const loadedEntries = await getAllEntries();
        console.log('[JournalScreen] Loaded entries:', loadedEntries);
        setEntries(loadedEntries);
      } catch (err) {
        const errorMessage = "Failed to load journal entries";
        setError(errorMessage);
        showErrorAlert("Error", errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoadEntries();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const loadedEntries = await getAllEntries();
      setEntries(loadedEntries);
      setError(null);
    } catch (err) {
      const errorMessage = "Failed to refresh entries";
      setError(errorMessage);
      showErrorAlert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate("EntryDetail", { entryId: entry.id });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDuration = (duration: number) => {
    if (!duration || duration === 0) return "0m 0s";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}m ${seconds}s`;
  };

  const groupEntriesByDate = (entries: JournalEntry[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    
    const grouped = {
      today: [] as JournalEntry[],
      yesterday: [] as JournalEntry[],
      older: [] as JournalEntry[]
    };
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt).toDateString();
      if (entryDate === todayStr) {
        grouped.today.push(entry);
      } else if (entryDate === yesterdayStr) {
        grouped.yesterday.push(entry);
      } else {
        grouped.older.push(entry);
      }
    });
    
    return grouped;
  };

  const renderEntryItem = (entry: JournalEntry) => {
    return (
      <TouchableOpacity 
        key={entry.id}
        style={styles.entryItem} 
        onPress={() => handleEntryPress(entry)}
      >
        <View style={styles.entryContent}>
          <View style={styles.microphoneIcon}>
            <Ionicons name="mic" size={24} color="#0e141b" />
          </View>
          <View style={styles.entryDetails}>
            <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
            <Text style={styles.entryText} numberOfLines={2}>
              {entry.text || "No transcription available"}
            </Text>
            <Text style={styles.entryMood}>{entry.mood || "Neutral"}</Text>
          </View>
        </View>
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            {formatDuration(entry.duration)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && entries.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
        <Text style={styles.loadingText}>Loading entries...</Text>
      </SafeAreaView>
    );
  }

  if (error && entries.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const groupedEntries = groupEntriesByDate(entries);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VoiceJournal</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#0e141b" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={24} color="#4e7097" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search entries"
            placeholderTextColor="#4e7097"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>All</Text>
          <Ionicons name="chevron-down" size={20} color="#0e141b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Mood</Text>
          <Ionicons name="chevron-down" size={20} color="#0e141b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Keywords</Text>
          <Ionicons name="chevron-down" size={20} color="#0e141b" />
        </TouchableOpacity>
      </View>

      {/* Entries List */}
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <View>
            {/* Today Section */}
            {groupedEntries.today.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Today</Text>
                {groupedEntries.today.map(renderEntryItem)}
              </View>
            )}

            {/* Yesterday Section */}
            {groupedEntries.yesterday.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Yesterday</Text>
                {groupedEntries.yesterday.map(renderEntryItem)}
              </View>
            )}

            {/* Older Entries */}
            {groupedEntries.older.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Earlier</Text>
                {groupedEntries.older.map(renderEntryItem)}
              </View>
            )}

            {/* Empty State */}
            {entries.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="journal" size={64} color="#4e7097" />
                <Text style={styles.emptyText}>No entries yet</Text>
                <Text style={styles.emptySubtext}>
                  Your recorded entries will appear here
                </Text>
              </View>
            )}
          </View>
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // slate-50
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: "#4e7097",
    marginTop: 16,
  } as TextStyle,
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  } as ViewStyle,
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginTop: 16,
    textAlign: "center",
  } as TextStyle,
  retryButton: {
    marginTop: 24,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  } as ViewStyle,
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  } as TextStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  } as ViewStyle,
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0e141b",
    flex: 1,
    textAlign: "center",
    paddingLeft: 48, // Offset for the add button
  } as TextStyle,
  addButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  } as ViewStyle,
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7edf3",
    borderRadius: 12,
    height: 48,
  } as ViewStyle,
  searchIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0e141b",
    paddingRight: 16,
    paddingLeft: 8,
  } as TextStyle,
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  } as ViewStyle,
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7edf3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  } as ViewStyle,
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0e141b",
  } as TextStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0e141b",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  } as TextStyle,
  entryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
  } as ViewStyle,
  entryContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 16,
  } as ViewStyle,
  microphoneIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#e7edf3",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  entryDetails: {
    flex: 1,
    justifyContent: "center",
  } as ViewStyle,
  entryDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0e141b",
    marginBottom: 4,
  } as TextStyle,
  entryText: {
    fontSize: 14,
    color: "#4e7097",
    lineHeight: 20,
    marginBottom: 4,
  } as TextStyle,
  entryMood: {
    fontSize: 14,
    color: "#4e7097",
  } as TextStyle,
  durationContainer: {
    justifyContent: "flex-start",
    paddingTop: 4,
  } as ViewStyle,
  durationText: {
    fontSize: 14,
    color: "#4e7097",
  } as TextStyle,
  listContent: {
    paddingBottom: 20,
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 100,
  } as ViewStyle,
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0e141b",
    marginTop: 16,
  } as TextStyle,
  emptySubtext: {
    fontSize: 14,
    color: "#4e7097",
    marginTop: 8,
    textAlign: "center",
  } as TextStyle,
});

export default JournalScreen;
