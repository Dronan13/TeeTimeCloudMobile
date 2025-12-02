import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const dateUtils = {
  /**
   * Format date to display string
   */
  formatDate(date: string | Date, format = 'MMM D, YYYY'): string {
    return dayjs(date).format(format);
  },

  /**
   * Format time to display string
   */
  formatTime(time: string, format = 'h:mm A'): string {
    return dayjs(time, 'HH:mm:ss').format(format);
  },

  /**
   * Format datetime to display string
   */
  formatDateTime(datetime: string | Date, format = 'MMM D, YYYY h:mm A'): string {
    return dayjs(datetime).format(format);
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  formatRelative(date: string | Date): string {
    return dayjs(date).fromNow();
  },

  /**
   * Check if date is today
   */
  isToday(date: string | Date): boolean {
    return dayjs(date).isSame(dayjs(), 'day');
  },

  /**
   * Check if date is in the past
   */
  isPast(date: string | Date): boolean {
    return dayjs(date).isBefore(dayjs());
  },

  /**
   * Check if date is in the future
   */
  isFuture(date: string | Date): boolean {
    return dayjs(date).isAfter(dayjs());
  },

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getToday(): string {
    return dayjs().format('YYYY-MM-DD');
  },

  /**
   * Get date N days from now
   */
  addDays(days: number, from?: string | Date): string {
    const base = from ? dayjs(from) : dayjs();
    return base.add(days, 'day').format('YYYY-MM-DD');
  },

  /**
   * Parse date string
   */
  parse(dateString: string, format?: string): dayjs.Dayjs {
    return format ? dayjs(dateString, format) : dayjs(dateString);
  },

  /**
   * Get day of week
   */
  getDayOfWeek(date: string | Date): string {
    return dayjs(date).format('dddd');
  },

  /**
   * Combine date and time strings
   */
  combineDateTime(date: string, time: string): string {
    return `${date}T${time}`;
  },

  /**
   * Get time difference in hours
   */
  diffInHours(date1: string | Date, date2: string | Date): number {
    return dayjs(date1).diff(dayjs(date2), 'hour');
  },

  /**
   * Get time difference in minutes
   */
  diffInMinutes(date1: string | Date, date2: string | Date): number {
    return dayjs(date1).diff(dayjs(date2), 'minute');
  },
};