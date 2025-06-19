import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JournalEntry } from '../data/schemas';
import { formatDateTime, getRelativeTime } from '../utils/dateUtils';
import { getMoodConfig } from '../utils/moodUtils';
import { theme } from '../theme/theme';

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
            color={theme.colors.surface} 
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
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    shadowColor: theme.shadows.base.shadowColor,
    shadowOffset: theme.shadows.base.shadowOffset,
    shadowOpacity: theme.shadows.base.shadowOpacity,
    shadowRadius: theme.shadows.base.shadowRadius,
    elevation: theme.shadows.base.elevation,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  dateText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  } as TextStyle,
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  } as ViewStyle,
  moodText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.xs,
  } as TextStyle,
  previewText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  fullDateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  } as TextStyle,
});

export default EntryCard;