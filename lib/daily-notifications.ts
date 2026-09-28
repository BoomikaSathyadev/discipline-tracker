'use client';

import { createClient } from './supabase';

export type DailyNotificationState = 'enabled' | 'disabled' | 'denied' | 'unsupported';

export function dailyNotificationErrorMessage(error: unknown): string {
  const details = error as { code?: unknown; message?: unknown; name?: unknown };
  const code = typeof details?.code === 'string' ? details.code : '';
  const message = typeof details?.message === 'string' ? details.message : '';
  const name = typeof details?.name === 'string' ? details.name : '';

  if (message.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured')) {
    return 'Vercel is missing NEXT_PUBLIC_VAPID_PUBLIC_KEY. Set it to the VAPID public key and redeploy.';
  }
  if (message.includes('Authentication is required')) {
    return 'Your Discipline Tracker session has expired. Sign in again, then enable the reminder.';
  }
  if (code === 'PGRST205' || (message.includes('daily_notification_subscriptions') && /schema cache|could not find/i.test(message))) {
    return 'The Supabase notification table is unavailable. Run the notification migration with supabase db push.';
  }
  if (code === '42501' || /row-level security|permission denied/i.test(message)) {
    return 'Supabase rejected the subscription under RLS. Verify the notification table migration and user policy.';
  }
  if (name === 'InvalidAccessError') {
    return 'The VAPID public key is invalid or does not match the key configured in Supabase.';
  }
  if (name === 'NotAllowedError') {
    return 'Chrome blocked push subscription. Allow notifications for Discipline Tracker in Android settings.';
  }
  return 'Could not update the reminder. Check that the VAPID key and Supabase notification migration are configured.';
}

function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function decodeApplicationServerKey(value: string): ArrayBuffer {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index++) bytes[index] = raw.charCodeAt(index);
  return bytes.buffer;
}

function isSupported() {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
    && 'PushManager' in window;
}

export async function loadDailyNotificationState(): Promise<DailyNotificationState> {
  if (!isSupported()) return 'unsupported';

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'disabled';

  if (Notification.permission === 'default') return 'disabled';

  if (Notification.permission === 'denied') {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      const { error } = await supabase
        .from('daily_notification_subscriptions')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);
      if (error) throw error;
    }
    return 'denied';
  }

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return 'disabled';

  const { data, error } = await supabase
    .from('daily_notification_subscriptions')
    .select('active')
    .eq('user_id', user.id)
    .eq('endpoint', subscription.endpoint)
    .maybeSingle();
  if (error) throw error;

  if (data?.active) {
    const { error: timezoneError } = await supabase
      .from('daily_notification_subscriptions')
      .update({ time_zone: getTimeZone(), updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint);
    if (timezoneError) throw timezoneError;
  }

  return data?.active ? 'enabled' : 'disabled';
}

export async function enableDailyNotifications(): Promise<DailyNotificationState> {
  if (!isSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured');

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'disabled';

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication is required to enable reminders');

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeApplicationServerKey(publicKey),
  });
  const keys = subscription.toJSON().keys;
  if (!keys?.p256dh || !keys.auth) throw new Error('The browser did not provide push subscription keys');

  const { error } = await supabase.from('daily_notification_subscriptions').upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh,
    auth_key: keys.auth,
    active: true,
    time_zone: getTimeZone(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,endpoint' });
  if (error) throw error;

  return 'enabled';
}

export async function disableDailyNotifications(): Promise<void> {
  if (!isSupported()) return;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication is required to disable reminders');

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const { error } = await supabase
    .from('daily_notification_subscriptions')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('endpoint', subscription.endpoint);
  if (error) throw error;
  await subscription.unsubscribe();
}
