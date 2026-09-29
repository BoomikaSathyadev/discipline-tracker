const APP_ORIGIN = 'https://discipline-tracker-teal.vercel.app';
const TODAY_URL = `${APP_ORIGIN}/today`;

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  event.waitUntil(self.registration.showNotification(
    payload.title || 'Time for your daily check-in',
    {
      body: payload.body || 'Mark your routines and update today’s progress.',
      icon: '/discipline-icon-192.png',
      badge: '/discipline-icon-192.png',
      tag: 'daily-check-in',
      data: { url: TODAY_URL },
    },
  ));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationUrl = event.notification.data?.url;
  const targetUrl = typeof notificationUrl === 'string' ? new URL(notificationUrl, APP_ORIGIN) : null;
  const target = targetUrl?.origin === APP_ORIGIN ? targetUrl.href : TODAY_URL;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const appWindow of windows) {
      if (new URL(appWindow.url).origin !== APP_ORIGIN) continue;
      try {
        const focusedWindow = await appWindow.focus();
        const navigatedWindow = await focusedWindow.navigate(target);
        return await (navigatedWindow ?? focusedWindow).focus();
      } catch {
        // Try another matching window, then open the app if none can navigate.
      }
    }
    return self.clients.openWindow(target);
  })());
});
