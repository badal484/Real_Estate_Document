import { format, formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy');
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy h:mm a');
}

export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function daysUntil(iso: string): number {
  return differenceInDays(new Date(iso), new Date());
}

export function isOverdue(iso: string): boolean {
  return isPast(new Date(iso));
}

export function urgencyLabel(iso: string): string {
  const days = daysUntil(iso);
  if (days < 0)  return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 3)  return `${days} days left`;
  return `${days} days`;
}
