/* eslint-disable no-undef */
/**
 * Messaging-only service worker for the CEVONS Admin app.
 *
 * It is NOT an app-shell cache: it never intercepts fetches and never stores
 * pages. Its only jobs are showing background push notifications and opening
 * the right admin screen when one is tapped.
 *
 * Firebase config arrives on the query string because a service worker cannot
 * read import.meta.env.
 */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const config = Object.fromEntries(new URL(self.location).searchParams);
firebase.initializeApp(config);
firebase.messaging();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = (event.notification.data && event.notification.data.path) || "/admin";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes("/admin")) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch {
              /* focus alone is enough */
            }
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
