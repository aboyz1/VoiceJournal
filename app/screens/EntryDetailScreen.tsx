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
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text>Entry not found</Text>
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
              color="white" 
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
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSliderValueChange}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E5E5EA"
              thumbTintColor="#007AFF"
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
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  moodText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
  },
});

export default EntryDetailScreen;