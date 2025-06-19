/**
 * Validate if text is not empty or just whitespace
 * @param text - Text to validate
 * @returns True if valid, false otherwise
 */
export const isValidText = (text: string): boolean => {
  return text.trim().length > 0;
};

/**
 * Validate if audio URI is valid
 * @param uri - Audio URI to validate
 * @returns True if valid, false otherwise
 */
export const isValidAudioUri = (uri: string): boolean => {
  return uri.trim().length > 0 && (uri.startsWith('file://') || uri.startsWith('http'));
};

/**
 * Validate journal entry data
 * @param entry - Entry data to validate
 * @returns Validation result with errors
 */
export const validateJournalEntry = (entry: {
  text: string;
  audioUri: string;
  mood: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isValidText(entry.text)) {
    errors.push('Entry text cannot be empty');
  }

  if (!isValidAudioUri(entry.audioUri)) {
    errors.push('Invalid audio file');
  }

  if (!entry.mood || entry.mood.trim().length === 0) {
    errors.push('Mood is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
