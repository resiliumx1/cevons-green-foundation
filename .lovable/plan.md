# Admin as an installable app with push notifications

Turn the `/admin` section into something Romina and the team can install on a phone home screen and get real notifications from, even when the browser is closed. The public website is untouched.

## What you get

- An installable CEVONS Admin app: add to home screen, CEVONS icon, opens in its own window with no browser chrome.
- Push notifications on the phone for every alert that already reaches the bell: new service requests, new contact messages, reviews, campaigns and system notices.
- Tapping a notification opens the admin straight on the relevant screen (the lead, the message, the notifications panel).
- A "Notifications on this device" control in Admin → Settings: turn push on, see whether this device is registered, turn it off again.
- No offline mode — the admin always loads fresh, live data.

## What is needed from you

Push delivery runs through Firebase Cloud Messaging (Google's free push service). I will open the connect card in chat; it asks for a Firebase project's service account plus the web push details. If there is no Firebase project yet, one can be created for free in a few minutes. Nothing else is required from you.

Note on iPhones: Apple only allows push once the site is installed to the home screen. Android and desktop work either way.

## How it works

```text
new lead / message  ->  notifications row (already exists)
                         |
                         v
                 database trigger (pg_net)
                         |
                         v
            /api/public/notify/push  (secret-authorised)
                         |
                         v
        Firebase Cloud Messaging  ->  registered admin devices
```

## Technical detail

1. **Installability**
   - `public/manifest.webmanifest`: name "CEVONS Admin", `start_url: /admin`, `scope: /admin`, `display: standalone`, brand navy background, orange theme colour.
   - Maskable/any icons at 192, 512 generated from the CEVONS mark into `public/assets/brand/`.
   - Manifest and `apple-touch-icon` / `theme-color` tags added only on the admin route head (`src/routes/admin.tsx`), so the public site's SEO head stays as is.
   - No app-shell service worker, no `vite-plugin-pwa`, no offline caching.

2. **Push registration (client)**
   - Connect the Firebase Cloud Messaging connector (`standard_connectors--connect`) with web push included.
   - `public/firebase-messaging-sw.js` — messaging worker only (config passed via query string), with a `notificationclick` handler that focuses/opens the target admin path.
   - `src/lib/push/enablePush.ts` — `enablePush()` per the Firebase web pattern; handles `not-configured`, `unsupported`, `open-in-new-tab` (Lovable preview iframe), `denied` with plain-language copy.
   - New table `admin_push_tokens` (`user_id`, `token` unique, `user_agent`, `created_at`, `last_seen_at`), RLS + GRANTs so a signed-in admin manages only their own rows; service_role full access.
   - `src/lib/push.functions.ts` — `registerPushToken` / `unregisterPushToken` server fns behind `requireSupabaseAuth`.
   - UI card in `src/routes/admin.settings.tsx` plus a soft prompt in the bell panel when permission has never been asked.

3. **Sending**
   - `src/routes/api/public/notify/push.ts` — bearer-secret authorised (same pattern as the existing `notify/dispatch` route), reads all `admin_push_tokens`, sends one FCM message per token through the Lovable connector gateway (`v1/projects/_/messages:send`), deletes tokens that come back `UNREGISTERED`/`INVALID_ARGUMENT`.
   - Migration adding an `AFTER INSERT` trigger on `public.notifications` that calls the route with `pg_net` using the stable project URL, carrying title/body/type/link from the row. Respects the existing `notification_preferences` toggles so muted types don't push.
   - Emails and the existing bell/realtime flow are not changed.

4. **Verification**
   - Manifest served and valid; admin installs on Android with the right name/icon.
   - Insert a test notification row and confirm delivery to a registered device, plus correct deep link on tap.
   - Typecheck + build clean; no change to public-site design or contrast.
