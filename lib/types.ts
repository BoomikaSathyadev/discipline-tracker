export interface SleepData {
  bedtime: string;
  wakeTime: string;
  durationHours: number;
}

export interface ScreenTimeData {
  totalMinutes: number;
  /** Legacy database value retained only when updating historical entries. */
  legacySocialMediaMinutes?: number | null;
}

export interface HabitsData {
  wokeUpOnTime: boolean;
  completedMainTask: boolean;
  keptOrganized: boolean;
  limitedSocialMedia: boolean;
  followedRoutine: boolean;
  readBook: boolean;
  drankWater: boolean;
  noAddedSugar: boolean;
}

export type ExerciseLevel = 'none' | 'faceYoga' | 'workout' | 'fullExercise';

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  sleep: SleepData;
  screenTime: ScreenTimeData;
  steps: number;
  exercise: boolean;
  exerciseLevel?: ExerciseLevel;
  learningMinutes: number;
  learningTopic: string;
  habits: HabitsData;
  mood: number;
  dayRating: number;
  note: string;
  disciplineScore: number;
  createdAt: string;
  updatedAt: string;
}

export type PartialEntry = Omit<DailyEntry, 'disciplineScore' | 'createdAt' | 'updatedAt'>;
