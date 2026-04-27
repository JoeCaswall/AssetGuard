/**
 * Date manipulation and formatting utilities
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date: Date | number, formatStr: string = 'PPP'): string => {
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date: Date | number, formatStr: string = 'PPP p'): string => {
  return format(new Date(date), formatStr);
};

export const formatRelativeTime = (date: Date | number): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getTimestamp = (): number => {
  return Date.now();
};

export const isToday = (date: Date | number): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
};
