import { PartialEntry } from './types';

export interface ScoreBreakdown {
  total: number;
  items: { label: string; earned: number; max: number }[];
}

export const MAX_SCORE = 100;

export function calculateMainTaskPoints(studyMinutes: number): number {
  if (studyMinutes >= 120) return 7;
  if (studyMinutes >= 60) return 5;
  if (studyMinutes >= 30) return 3;
  if (studyMinutes >= 1) return 1;
  return 0;
}

export function calculateScore(entry: PartialEntry): ScoreBreakdown {
  const items: { label: string; earned: number; max: number }[] = [];

  // Habits (6 × 7 = 42 pts)
  const habitPoints = 7;
  items.push({ label: 'Woke up on time', earned: entry.habits.wokeUpOnTime ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Completed main task', earned: calculateMainTaskPoints(entry.learningMinutes), max: habitPoints });
  items.push({ label: 'Kept surroundings organized', earned: entry.habits.keptOrganized ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Limited social media', earned: entry.habits.limitedSocialMedia ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Followed planned routine', earned: entry.habits.followedRoutine ? habitPoints : 0, max: habitPoints });
  items.push({ label: 'Read a book', earned: (entry.habits.readBook ?? false) ? habitPoints : 0, max: habitPoints });

  // Exercise selections are independent; keep legacy single-level values readable.
  const exercisePointsBySelection = { faceYoga: 5, workout: 8 } as const;
  const exerciseLabels = { faceYoga: 'Face Yoga', workout: 'Workout' } as const;
  const exerciseSelections = entry.exerciseSelections ?? [];
  const legacyExerciseLevel = entry.exerciseLevel ?? (entry.exercise ? 'fullExercise' : 'none');
  const exercisePoints = exerciseSelections.length > 0
    ? exerciseSelections.reduce((sum, selection) => sum + exercisePointsBySelection[selection], 0)
    : ({ none: 0, faceYoga: 5, workout: 8, fullExercise: 13 } as const)[legacyExerciseLevel];
  const exerciseLabel = exerciseSelections.length > 0
    ? `Exercise (${exerciseSelections.map(selection => exerciseLabels[selection]).join(' + ')})`
    : legacyExerciseLevel === 'fullExercise'
      ? 'Exercise (legacy Full Exercise)'
      : legacyExerciseLevel === 'none'
        ? 'Exercise'
        : `Exercise (legacy ${exerciseLabels[legacyExerciseLevel]})`;
  items.push({ label: exerciseLabel, earned: exercisePoints, max: 13 });

  // Learning (15 pts) — 1 point per 8 min, rounded up, capped at 15
  const learnPts = entry.learningMinutes > 0
    ? Math.min(15, Math.ceil(entry.learningMinutes / 8))
    : 0;
  items.push({ label: 'Learning / study time', earned: learnPts, max: 15 });

  // Sleep (15 pts) — full points for 7–9 h
  const h = entry.sleep.durationHours;
  const sleepPts = h >= 7 && h <= 9 ? 15 : h >= 6 && h < 7 ? 10 : h > 9 && h <= 10 ? 10 : h >= 5 ? 5 : 0;
  items.push({ label: 'Sleep quality (7–9 h)', earned: sleepPts, max: 15 });

  // Step goals (15 pts) — gradual score at each daily target.
  const stepPts = entry.steps >= 8000 ? 15
    : entry.steps >= 6000 ? 12
      : entry.steps >= 4000 ? 8
        : entry.steps >= 2000 ? 4
          : 0;
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
