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
      data: { url: '/today' },
    },
  ));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationUrl = event.notification.data?.url;
  const targetUrl = new URL(
    typeof notificationUrl === 'string' ? notificationUrl : '/today',
    self.location.origin,
  );
  const target = targetUrl.origin === self.location.origin
    ? targetUrl.href
    : new URL('/today', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const appWindow = windows.find(client => new URL(client.url).origin === self.location.origin);
    if (appWindow) {
      try {
        const navigatedWindow = await appWindow.navigate(target);
        if (navigatedWindow) return await navigatedWindow.focus();
      } catch {
        // Fall through and open the app if the existing window cannot navigate.
      }
    }
    return self.clients.openWindow(target);
  })());
});
