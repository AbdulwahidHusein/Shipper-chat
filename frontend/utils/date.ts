import { format } from 'date-fns';

export const formatMessageTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
