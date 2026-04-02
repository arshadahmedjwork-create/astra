import { addDays, format, isWeekend, startOfDay, isBefore, isEqual } from 'date-fns';

export type FrequencyType = 'daily' | 'alternate' | 'weekdays' | 'custom';

/**
 * Generate an array of ISO date strings from a start/end range + frequency type.
 */
export function generateDatesFromFrequency(
  start: Date,
  end: Date,
  type: Exclude<FrequencyType, 'custom'>
): string[] {
  const dates: string[] = [];
  let current = startOfDay(new Date(start));
  const endDay = startOfDay(new Date(end));

  while (!isBefore(endDay, current)) {
    const dateStr = format(current, 'yyyy-MM-dd');

    if (type === 'daily') {
      dates.push(dateStr);
      current = addDays(current, 1);
    } else if (type === 'alternate') {
      dates.push(dateStr);
      current = addDays(current, 2);
    } else if (type === 'weekdays') {
      if (!isWeekend(current)) {
        dates.push(dateStr);
      }
      current = addDays(current, 1);
    }
  }

  return dates;
}

/**
 * Toggle a date string in/out of the selected dates array.
 */
export function toggleDate(dates: string[], date: string): string[] {
  if (dates.includes(date)) {
    return dates.filter((d) => d !== date);
  }
  return [...dates, date].sort();
}

/**
 * Calculate total cost for a subscription period.
 */
export function calculateSubscriptionTotal(
  pricePerUnit: number,
  quantity: number,
  dates: string[]
): number {
  return pricePerUnit * quantity * dates.length;
}

/**
 * Return the next upcoming delivery date from today.
 */
export function getNextDeliveryDate(dates: string[]): string | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcoming = dates.filter((d) => d >= today).sort();
  return upcoming[0] || null;
}

/**
 * Count how many deliveries are still in the future.
 */
export function getRemainingDeliveries(dates: string[]): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  return dates.filter((d) => d >= today).length;
}

/**
 * Format a date string nicely for display.
 */
export function formatDeliveryDate(dateStr: string): string {
  try {
    return format(new Date(dateStr + 'T00:00:00'), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}
