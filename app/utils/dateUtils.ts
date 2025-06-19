/**
 * Format a date for display in the UI
 * @param date - Date to format
 * @returns Formatted date string like "6/19/2025 • 1:32 PM"
 */
export const formatDateTime = (date: Date): string => {
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `${dateStr} • ${timeStr}`;
};

/**
 * Format just the date part
 * @param date - Date to format
 * @returns Formatted date string like "6/19/2025"
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

/**
 * Format just the time part
 * @param date - Date to format
 * @returns Formatted time string like "1:32 PM"
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Format milliseconds to MM:SS format
 * @param millis - Milliseconds to format
 * @returns Formatted time string like "1:23"
 */
export const formatDuration = (millis: number): string => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Get relative time string (e.g., "2 hours ago", "Yesterday")
 * @param date - Date to compare
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatDate(date);
};
