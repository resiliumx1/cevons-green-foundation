# CEVONS Admin as an installable app with working notifications

Most of the groundwork already exists: the admin has its own app identity (name, CEVONS logo icons, navy theme), a device-alerts switch in Admin -> Settings, a table of registered devices, a sending endpoint and a database trigger that fires on every new notification.

Two things are missing, and this plan finishes both: nobody is ever *invited* to install the app, and push delivery is not connected, so no alert ever leaves the server.

## What you and the team will get

- A friendly "Install CEVONS Admin" prompt inside the admin, tailored to the phone being used:
  - Android / Chrome / Edge desktop: a one-tap Install button.
  - iPhone / iPad Safari: step-by-step "Share -> Add to Home Screen" instructions, since Apple gives no install button.
  - Already installed, or dismissed: the prompt stays hidden (dismissal remembered, re-offered after 30 days).
- Real phone notifications for new service requests, messages, reviews and system notices - even with the admin closed. Tapping one opens the relevant screen.
- A clear "Alerts on this device" card that tells the truth about the current state: on, off, blocked, or "install the app first" on iPhone.
- App icon on the home screen is the CEVONS logo (already generated at 192/512/maskable/Apple sizes).

## What is needed from you

Push delivery runs on Firebase Cloud Messaging (Google's free push service). I will open the connect card in chat - it asks for a Firebase project's service account plus web push details. A Firebase project is free and takes a few minutes to create if there isn't one. Until that is connected, everything else works and the alerts card honestly says notifications aren't set up yet.

Note: on iPhone, Apple only allows notifications after the app has been added to the home screen. Android and desktop work either way.

## Technical detail

1. **Install prompt** - new `src/components/admin/InstallAppCard.tsx` plus a small `useInstallPrompt` hook:
   - captures `beforeinstallprompt`, exposes `promptInstall()`, detects `display-mode: standalone` / `navigator.standalone` to hide when installed;
   - iOS Safari branch renders the Add-to-Home-Screen steps with the share glyph;
   - dismissal stored in `localStorage` (`cevons-admin-install-dismissed`), re-shown after 30 days;
   - rendered as a dismissible banner on the admin dashboard (`admin.index.tsx`) and as a permanent card in `admin.settings.tsx` above the alerts card.

2. **Manifest polish** (`public/admin.webmanifest`) - add `display_override: ["standalone","minimal-ui"]`, `categories`, and a maskable 192 icon so Android doesn't crop the mark; keep `start_url`/`scope` `/admin` unchanged (installed copies cache these, so they must not move).

3. **Push connection** - run `standard_connectors--connect` for Firebase Cloud Messaging with web push. That populates `FIREBASE_MESSAGING_API_KEY` server-side and the `VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_*` values the browser needs. No code change required in `enablePush.ts`, `push.functions.ts` or `api/public/notify/push.ts` - they are already written against these names.

4. **Alerts card accuracy** (`PushDevicesCard.tsx`) - surface the iOS "install first" case explicitly, show the count of registered devices via the existing `countMyPushDevices` server function, and restyle it to the current light admin theme (it still uses the old dark palette).

5. **Verification** - install the admin on an Android profile in a real browser session and confirm name/icon/standalone; insert a test notification row and confirm it arrives on a registered device and deep-links correctly; check the messaging service worker never intercepts page requests (it only handles notifications); build and typecheck clean.

No public page, route, auth rule or backend behaviour outside the notification path changes, and nothing is published without your say-so.
