-- Add independent activity selections while retaining legacy exercise values.
alter table public.discipline_entries
  add column if not exists exercise_face_yoga boolean not null default false,
  add column if not exists exercise_workout boolean not null default false,
  add column if not exists exercise_zumba boolean not null default false;

-- Translate legacy single selections only where no new selection is present.
-- The original exercise and exercise_level columns remain unchanged.
update public.discipline_entries
set exercise_face_yoga = true
where exercise_level = 'faceYoga'
  and not exercise_face_yoga
  and not exercise_workout
  and not exercise_zumba;

update public.discipline_entries
set exercise_face_yoga = true,
    exercise_workout = true
where exercise_level = 'workout'
  and not exercise_face_yoga
  and not exercise_workout
  and not exercise_zumba;
