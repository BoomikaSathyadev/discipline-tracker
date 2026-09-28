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
  const target = new URL('/today', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const appWindow = windows.find(client => client.url.startsWith(self.location.origin));
    if (appWindow) {
      try {
        await appWindow.navigate(target);
        return await appWindow.focus();
      } catch {
        // Fall through and open a new app window if the existing one closed.
      }
    }
    return self.clients.openWindow(target);
  })());
});
