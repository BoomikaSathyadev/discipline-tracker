create table if not exists public.daily_notification_subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  active boolean not null default true,
  time_zone text not null,
  last_sent_local_date date,
  updated_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);

alter table public.daily_notification_subscriptions enable row level security;

grant select, insert, update, delete on public.daily_notification_subscriptions to authenticated;

create policy "Users manage their own notification subscriptions"
  on public.daily_notification_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
