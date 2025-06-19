import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JournalEntry } from '../data/schemas';
import { formatDateTime, getRelativeTime } from '../utils/dateUtils';
import { getMoodConfig } from '../utils/moodUtils';

interface EntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onPress }) => {
  const moodConfig = getMoodConfig(entry.mood);
  
  // Truncate text for preview
  const previewText = entry.text.length > 100 
    ? entry.text.substring(0, 100) + '...' 
    : entry.text;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {getRelativeTime(entry.createdAt)}
        </Text>
        <View style={[styles.moodBadge, { backgroundColor: moodConfig.color }]}>
          <Ionicons 
            name={moodConfig.icon as any} 
            size={12} 
            color="white" 
          />
          <Text style={styles.moodText}>
            {moodConfig.displayName.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.previewText} numberOfLines={3}>
        {previewText}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.fullDateText}>
          {formatDateTime(entry.createdAt)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
    fontWeight: '600',
    color: '#1C1C1E',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3C3C43',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullDateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default EntryCard;