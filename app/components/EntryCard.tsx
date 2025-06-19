import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JournalEntry } from '../data/schemas';

type EntryCardProps = {
  entry: JournalEntry;
  onPress: () => void;
};

const moodIcons = {
  happy: 'happy',
  sad: 'sad',
  angry: 'flame',
  neutral: 'remove',
  excited: 'flash',
  calm: 'moon',
};

const moodColors = {
  happy: '#34C759',
  sad: '#0A84FF',
  angry: '#FF3B30',
  neutral: '#8E8E93',
  excited: '#FFCC00',
  calm: '#5856D6',
};

const EntryCard: React.FC<EntryCardProps> = ({ entry, onPress }) => {
  const formattedDate = entry.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const time = entry.createdAt.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const snippet = entry.text.length > 100 
    ? `${entry.text.substring(0, 100)}...` 
    : entry.text;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{formattedDate} • {time}</Text>
        <View style={[styles.moodContainer, { backgroundColor: moodColors[entry.mood as keyof typeof moodColors] }]}>
          <Ionicons 
            name={moodIcons[entry.mood as keyof typeof moodIcons] as any} 
            size={14} 
            color="white" 
          />
          <Text style={styles.moodText}>{entry.mood.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.snippetText}>{snippet}</Text>
      
      <View style={styles.footer}>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  moodText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  snippetText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'flex-end',
  },
});

export default EntryCard;