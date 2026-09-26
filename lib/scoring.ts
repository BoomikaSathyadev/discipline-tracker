import { PartialEntry } from './types';

export interface ScoreBreakdown {
  total: number;
  items: { label: string; earned: number; max: number }[];
}

export const MAX_SCORE = 100;

export function calculateScore(entry: PartialEntry): ScoreBreakdown {
  const items: { label: string; earned: number; max: number }[] = [];

  // Habits (6 × 7 = 42 pts)
  const habitPoints = 7;
  items.push({ label: 'Woke up on time', earned: entry.habits.wokeUpOnTime ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Completed main task', earned: entry.habits.completedMainTask ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Kept surroundings organized', earned: entry.habits.keptOrganized ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Limited social media', earned: entry.habits.limitedSocialMedia ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Followed planned routine', earned: entry.habits.followedRoutine ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Read a book', earned: (entry.habits.readBook ?? false) ? habitPoints : 0, max: habitPoints });

  // Exercise (13 pts)
  items.push({ label: 'Exercise completed', earned: entry.exercise ? 13 : 0, max: 13 });

  // Learning (15 pts) — full points for 30+ min
  const learnPts = Math.min(15, Math.round((entry.learningMinutes / 30) * 15));
  items.push({ label: 'Learning / study time', earned: learnPts, max: 15 });

  // Sleep (15 pts) — full points for 7–9 h
  const h = entry.sleep.durationHours;
  const sleepPts = h >= 7 && h <= 9 ? 15 : h >= 6 && h < 7 ? 10 : h > 9 && h <= 10 ? 10 : h >= 5 ? 5 : 0;
  items.push({ label: 'Sleep quality (7–9 h)', earned: sleepPts, max: 15 });

  // Steps (15 pts) — full points for 8000+ steps
  const stepPts = Math.min(15, Math.round((entry.steps / 8000) * 15));
  items.push({ label: 'Steps (goal: 8 000)', earned: stepPts, max: 15 });

  const total = items.reduce((sum, i) => sum + i.earned, 0);
  return { total, items };
}

export function scoreMessage(score: number): string {
  const pct = score / MAX_SCORE;
  if (pct >= 0.90) return 'Excellent consistency';
  if (pct >= 0.75) return 'Great day';
  if (pct >= 0.60) return 'Good day';
  if (pct >= 0.45) return 'Room for improvement';
  return 'Keep going — every day is a fresh start';
}
