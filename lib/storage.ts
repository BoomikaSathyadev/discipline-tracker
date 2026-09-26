import { createClient } from './supabase';
import { DailyEntry } from './types';

// Map a Supabase DB row → DailyEntry
function rowToEntry(row: Record<string, unknown>): DailyEntry {
  return {
    date: row.date as string,
    sleep: {
      bedtime: row.sleep_bedtime as string,
      wakeTime: row.sleep_wake_time as string,
      durationHours: row.sleep_duration_hours as number,
    },
    screenTime: {
      totalMinutes: row.screen_total_minutes as number,
      socialMediaMinutes: row.screen_social_minutes as number,
    },
    steps: row.steps as number,
    exercise: row.exercise as boolean,
    learningMinutes: row.learning_minutes as number,
    learningTopic: row.learning_topic as string,
    habits: {
      wokeUpOnTime: row.habit_woke_up_on_time as boolean,
      completedMainTask: row.habit_completed_main_task as boolean,
      keptOrganized: row.habit_kept_organized as boolean,
      limitedSocialMedia: row.habit_limited_social_media as boolean,
      followedRoutine: row.habit_followed_routine as boolean,
      readBook: (row.habit_read_book ?? false) as boolean,
    },
    mood: row.mood as number,
    dayRating: row.day_rating as number,
    note: (row.note ?? '') as string,
    disciplineScore: row.discipline_score as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Map a DailyEntry → Supabase DB row (without user_id, added by each function)
function entryToRow(entry: DailyEntry) {
  return {
    date: entry.date,
    sleep_bedtime: entry.sleep.bedtime,
    sleep_wake_time: entry.sleep.wakeTime,
    sleep_duration_hours: entry.sleep.durationHours,
    screen_total_minutes: entry.screenTime.totalMinutes,
    screen_social_minutes: entry.screenTime.socialMediaMinutes,
    steps: entry.steps,
    exercise: entry.exercise,
    learning_minutes: entry.learningMinutes,
    learning_topic: entry.learningTopic,
    habit_woke_up_on_time: entry.habits.wokeUpOnTime,
    habit_completed_main_task: entry.habits.completedMainTask,
    habit_kept_organized: entry.habits.keptOrganized,
    habit_limited_social_media: entry.habits.limitedSocialMedia,
    habit_followed_routine: entry.habits.followedRoutine,
    habit_read_book: entry.habits.readBook ?? false,
    mood: entry.mood,
    day_rating: entry.dayRating,
    note: entry.note,
    discipline_score: entry.disciplineScore,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

export async function getAllEntries(): Promise<DailyEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('discipline_entries')
    .select('*')
    .order('date', { ascending: false });
  if (error || !data) return [];
  return data.map(rowToEntry);
}

export async function saveEntry(entry: DailyEntry): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('discipline_entries')
    .upsert({ ...entryToRow(entry), user_id: user.id }, { onConflict: 'user_id,date' });
}

export async function deleteEntry(date: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('discipline_entries').delete().eq('date', date);
}

export async function clearAllData(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('discipline_entries').delete().eq('user_id', user.id);
}
