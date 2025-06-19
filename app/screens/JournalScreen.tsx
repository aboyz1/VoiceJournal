import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import EntryCard from '../components/EntryCard';
import { getAllEntries } from '../services/StorageService';
import { initDatabase } from '../data/Database';
import { JournalEntry } from '../data/schemas';
import { RootStackParamList } from '../navigation/AppNavigator';
import { showErrorAlert } from '../utils/alertUtils';
import { theme } from '../theme/theme';

type JournalScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const JournalScreen = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<JournalScreenNavigationProp>();

  useEffect(() => {
    const initializeAndLoadEntries = async () => {
      try {
        await initDatabase();
        const loadedEntries = await getAllEntries();
        setEntries(loadedEntries);
      } catch (err) {
        const errorMessage = 'Failed to load journal entries';
        setError(errorMessage);
        showErrorAlert('Error', errorMessage);
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
      const errorMessage = 'Failed to refresh entries';
      setError(errorMessage);
      showErrorAlert('Error', errorMessage);
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
        <TouchableOpacity onPress={handleRefresh} disabled={loading}>
          <Ionicons 
            name="refresh" 
            size={24} 
            color={loading ? theme.colors.textTertiary : theme.colors.secondary} 
          />
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="journal" size={64} color={theme.colors.textTertiary} />
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );

};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.md,
  } as TextStyle,
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    marginTop: theme.spacing.base,
    textAlign: 'center',
  } as TextStyle,
  retryButton: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.base,
  } as ViewStyle,
  retryButtonText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeight.semibold,
  } as TextStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  } as TextStyle,
  listContent: {
    paddingBottom: theme.spacing.xl,
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  } as ViewStyle,
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.base,
  } as TextStyle,
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  } as TextStyle,
});

export default JournalScreen;