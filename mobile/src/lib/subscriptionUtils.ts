// Same logic as web — copied to avoid cross-platform module complexity

export type FrequencyType = 'daily' | 'alternate' | 'weekdays' | 'custom';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateDatesFromFrequency(
  start: Date,
  end: Date,
  type: Exclude<FrequencyType, 'custom'>
): string[] {
  const dates: string[] = [];
  let current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (current <= endDay) {
    const dateStr = formatDate(current);

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

export function toggleDate(dates: string[], date: string): string[] {
  if (dates.includes(date)) {
    return dates.filter((d) => d !== date);
  }
  return [...dates, date].sort();
}

export function calculateSubscriptionTotal(
  pricePerUnit: number,
  quantity: number,
  dates: string[]
): number {
  return pricePerUnit * quantity * dates.length;
}

export function getNextDeliveryDate(dates: string[]): string | null {
  const today = formatDate(new Date());
  const upcoming = dates.filter((d) => d >= today).sort();
  return upcoming[0] || null;
}

export function getRemainingDeliveries(dates: string[]): number {
  const today = formatDate(new Date());
  return dates.filter((d) => d >= today).length;
}

export function formatDeliveryDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
