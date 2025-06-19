import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getEntry } from '../services/StorageService';
import { JournalEntry } from '../data/schemas';
import { formatDateTime, formatDuration } from '../utils/dateUtils';
import { getMoodConfig } from '../utils/moodUtils';
import { showErrorAlert } from '../utils/alertUtils';
import { theme } from '../theme/theme';

type EntryDetailRouteProp = RouteProp<RootStackParamList, 'EntryDetail'>;

const EntryDetailScreen = () => {
  const route = useRoute<EntryDetailRouteProp>();
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
        setError('Failed to load journal entry');
        showErrorAlert('Error', 'Failed to load journal entry');
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Entry not found</Text>
      </SafeAreaView>
    );
  }

  const moodConfig = getMoodConfig(entry.mood);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.dateText}>
            {formatDateTime(entry.createdAt)}
          </Text>
          
          <View style={[styles.moodContainer, { backgroundColor: moodConfig.color }]}>
            <Ionicons 
              name={moodConfig.icon as any} 
              size={16} 
              color={theme.colors.surface} 
            />
            <Text style={styles.moodText}>{moodConfig.displayName.toUpperCase()}</Text>
          </View>
        </View>

        {/* Audio Player */}
        <View style={styles.audioPlayer}>
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={handlePlayPause}
            disabled={!sound}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color={theme.colors.surface} 
            />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSliderValueChange}
              minimumTrackTintColor={theme.colors.secondary}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.secondary}
              disabled={!sound}
            />
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatDuration(position)}</Text>
              <Text style={styles.timeText}>{formatDuration(duration)}</Text>
            </View>
          </View>
        </View>

        {/* Entry Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{entry.text}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    marginTop: theme.spacing.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textTertiary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  moodText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.base,
  },
  playButton: {
    backgroundColor: theme.colors.secondary,
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.base,
  },
  progressContainer: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  contentContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    ...theme.shadows.base,
  },
  contentText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.fontSize.xl,
    color: theme.colors.textPrimary,
  },
});
export default EntryDetailScreen;