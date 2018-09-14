self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    console.log('fetch made')
  );
});

self.addEventListener('push', function(event) {
  const data = event.data.json();
  console.log('[Service Worker] Push Received.');

  const title = `${data.freq} just posted a new Award`;
  const options = {
    body: `New post in ${data.freq} by ${data.owner.substring(0,6)}. View on Tempo!`,
    icon: '/apple-icon-180x180.png',
    badge: 'images/badge.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();
  const url = "http://localhost:3000/";

  event.waitUntil(
        /*global clients*/
        clients.matchAll({includeUncontrolled: true, type: 'window'}).then( windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});