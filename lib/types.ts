export interface SleepData {
  bedtime: string;
  wakeTime: string;
  durationHours: number;
}

export interface ScreenTimeData {
  totalMinutes: number;
  socialMediaMinutes: number;
}

export interface HabitsData {
  wokeUpOnTime: boolean;
  completedMainTask: boolean;
  keptOrganized: boolean;
  limitedSocialMedia: boolean;
  followedRoutine: boolean;
  readBook: boolean;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  sleep: SleepData;
  screenTime: ScreenTimeData;
  steps: number;
  exercise: boolean;
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
