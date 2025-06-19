/**
 * Generate unique ID for database entries
 * @returns Unique string ID
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Get current timestamp in milliseconds
 * @returns Current timestamp
 */
export const getCurrentTimestamp = (): number => {
  return new Date().getTime();
};

/**
 * Convert timestamp to Date object
 * @param timestamp - Timestamp in milliseconds
 * @returns Date object
 */
export const timestampToDate = (timestamp: number): Date => {
  return new Date(timestamp);
};
