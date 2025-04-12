/**
 * Format a date as a locale string
 * @param dateStr - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

/**
 * Group dates by month
 * @param dateStr - Date string to get month from
 * @returns Month name
 */
export const getMonthFromDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('default', { month: 'long' });
  } catch (e) {
    console.error('Error getting month from date:', e);
    return '';
  }
};

/**
 * Convert a date or date string to ISO format
 * @param date - Date or date string to convert
 * @returns ISO format date string
 */
export const toISOString = (date: Date | string): string => {
  if (!date) return '';
  try {
    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return date.toISOString();
  } catch (e) {
    console.error('Error converting to ISO string:', e);
    return '';
  }
}; 