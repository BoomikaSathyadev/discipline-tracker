import { DailyEntry } from './types';

export interface StreakInfo {
  current: number;
  best: number;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: string, b: string): number {
  return Math.round(Math.abs(parseDate(a).getTime() - parseDate(b).getTime()) / 86400000);
}

export function calculateStreaks(entries: DailyEntry[]): StreakInfo {
  if (entries.length === 0) return { current: 0, best: 0 };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const [y, m, d] = new Date().toLocaleDateString('en-CA').split('-').map(Number);
  const today = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  let best = 0;
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i].date, sorted[i - 1].date) === 1) {
      streak++;
    } else {
      best = Math.max(best, streak);
      streak = 1;
    }
  }
  best = Math.max(best, streak);

  let current = 0;
  const lastDate = sorted[sorted.length - 1].date;
  if (daysBetween(lastDate, today) <= 1) {
    current = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      if (daysBetween(sorted[i].date, sorted[i - 1].date) === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  return { current, best };
}
