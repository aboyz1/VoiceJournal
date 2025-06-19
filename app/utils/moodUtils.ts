import { Mood } from '../data/schemas';

export interface MoodConfig {
  color: string;
  icon: string;
  description: string;
  displayName: string;
}

export const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  happy: {
    color: '#34C759',
    icon: 'happy',
    description: 'Positive sentiment detected',
    displayName: 'Happy'
  },
  sad: {
    color: '#007AFF',
    icon: 'sad',
    description: 'Negative sentiment detected',
    displayName: 'Sad'
  },
  angry: {
    color: '#FF3B30',
    icon: 'flame',
    description: 'Frustrated sentiment detected',
    displayName: 'Angry'
  },
  neutral: {
    color: '#8E8E93',
    icon: 'remove-circle',
    description: 'Neutral sentiment detected',
    displayName: 'Neutral'
  },
  excited: {
    color: '#FFCC00',
    icon: 'flash',
    description: 'Energetic sentiment detected',
    displayName: 'Excited'
  },
  calm: {
    color: '#5856D6',
    icon: 'leaf',
    description: 'Peaceful sentiment detected',
    displayName: 'Calm'
  }
};

/**
 * Get mood configuration by mood type
 * @param mood - Mood type
 * @returns Mood configuration object
 */
export const getMoodConfig = (mood: Mood): MoodConfig => {
  return MOOD_CONFIGS[mood] || MOOD_CONFIGS.neutral;
};

/**
 * Get mood color by mood type
 * @param mood - Mood type
 * @returns Hex color string
 */
export const getMoodColor = (mood: Mood): string => {
  return getMoodConfig(mood).color;
};

/**
 * Get mood icon by mood type
 * @param mood - Mood type
 * @returns Icon name string
 */
export const getMoodIcon = (mood: Mood): string => {
  return getMoodConfig(mood).icon;
};

/**
 * Get mood description by mood type
 * @param mood - Mood type
 * @returns Description string
 */
export const getMoodDescription = (mood: Mood): string => {
  return getMoodConfig(mood).description;
};

/**
 * Map sentiment score to mood
 * @param score - Sentiment score (-1 to 1)
 * @returns Mood type
 */
export const mapSentimentToMood = (score: number): Mood => {
  if (score > 0.6) return "excited";
  if (score > 0.3) return "happy";
  if (score > -0.3) return "neutral";
  if (score > -0.6) return "sad";
  return "angry";
};
