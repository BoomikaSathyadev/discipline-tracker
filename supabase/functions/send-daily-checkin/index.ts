import webpush from 'npm:web-push@3.6.7';

type PushSubscriptionRow = {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  time_zone: string;
  last_sent_local_date: string | null;
};

type PushSubscriptionData = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const cronSecret = Deno.env.get('CRON_SECRET')!;

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

function getLocalTime(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    hour: values.hour,
    minute: values.minute,
  };
}

async function updateSubscription(row: PushSubscriptionRow, update: Record<string, unknown>) {
  const query = new URLSearchParams({ user_id: `eq.${row.user_id}`, endpoint: `eq.${row.endpoint}` });
  const response = await fetch(`${supabaseUrl}/rest/v1/daily_notification_subscriptions?${query}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...update, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`Could not update subscription: ${response.status}`);
}

Deno.serve(async request => {
  if (!cronSecret || request.headers.get('x-cron-secret') !== cronSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/daily_notification_subscriptions?select=user_id,endpoint,p256dh,auth_key,time_zone,last_sent_local_date&active=eq.true`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } },
  );
  if (!response.ok) return new Response('Could not load notification subscriptions', { status: 502 });

  const subscriptions = await response.json() as PushSubscriptionRow[];
  let sent = 0;

  for (const row of subscriptions) {
    let localTime;
    try {
      localTime = getLocalTime(row.time_zone);
    } catch {
      continue;
    }
    if (localTime.hour !== '20' || localTime.minute !== '00' || row.last_sent_local_date === localTime.date) continue;

    const subscription: PushSubscriptionData = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth_key },
    };
    try {
      await webpush.sendNotification(subscription, JSON.stringify({
        title: 'Time for your daily check-in',
        body: 'Mark your routines and update today’s progress.',
        url: '/today',
      }));
      await updateSubscription(row, { last_sent_local_date: localTime.date });
      sent++;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await updateSubscription(row, { active: false });
      } else {
        console.error('Daily check-in push failed:', error);
      }
    }
  }

  return Response.json({ sent });
});
