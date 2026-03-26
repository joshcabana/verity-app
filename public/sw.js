// Verity Service Worker — Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Verity';
  const options = {
    body: data.body || 'Something happened on Verity.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/drops' },
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/drops';
  event.waitUntil(clients.openWindow(url));
});
