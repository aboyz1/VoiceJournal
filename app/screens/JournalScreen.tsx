import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EntryCard from '../components/EntryCard';
import { getAllEntries } from '../services/StorageService';
import { JournalEntry } from '../data/schemas';


const JournalScreen = ({ navigation }: { navigation: any }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const loadedEntries = await getAllEntries();
        setEntries(loadedEntries);
      } catch (err) {
        setError('Failed to load journal entries');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const loadedEntries = await getAllEntries();
      setEntries(loadedEntries);
    } catch (err) {
      setError('Failed to refresh entries');
    } finally {
      setLoading(false);
    }
  };

  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate('EntryDetail', { entryId: entry.id });
  };

  if (loading && entries.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal Entries</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="journal" size={64} color="#8E8E93" />
          <Text style={styles.emptyText}>No entries yet</Text>
          <Text style={styles.emptySubtext}>Your recorded entries will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard 
              entry={item} 
              onPress={() => handleEntryPress(item)} 
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );

};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default JournalScreen;