-- Additive fields for exercise levels and daily checklist habits.
-- Existing exercise booleans and habit columns remain untouched.
alter table public.discipline_entries
  add column if not exists exercise_level text,
  add column if not exists habit_drank_water boolean not null default false,
  add column if not exists habit_no_added_sugar boolean not null default false;

-- Preserve the existing meaning of recorded exercise (previously worth full exercise credit).
update public.discipline_entries
set exercise_level = case when exercise then 'fullExercise' else 'none' end
where exercise_level is null;
