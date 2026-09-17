# Admin app polish: spacing, navigation, no "Back to site" clutter

Make the admin feel like a real phone app: more breathing room, an easier menu, and no "Back to site" button crowding the top bar — while keeping a quiet way to reach the public site when needed.

## What you'll notice

- **Top bar, uncluttered.** On phones: menu button, page title, notification bell, your avatar. The search box becomes a simple search icon that opens the same full search panel — no more squashed, half-cut pill.
- **"Back to site" removed from the top bar** everywhere. A discreet "View website" link lives in the profile menu (tap your avatar) and at the bottom of the slide-out menu — there when you need it, never in the way. When running as the installed app, opening the site opens it in the browser, so you stay in the app.
- **Bottom tab bar on phones** (app-style): Dashboard, Requests (with count), Messages (with count), Notifications, and Menu. One-thumb access to the places you check most, always visible at the bottom — like a native app. Hidden on desktop.
- **Slide-out menu done well.** Wider touch targets (full finger height), clearer section grouping, the current section highlighted, smooth slide-in/out, and the CEVONS logo at the top so it feels branded.
- **Spacing pass.** Consistent gaps between cards, headings and the top bar on every admin screen at phone size — nothing touching edges, nothing cramped.
- Notifications, colours, wording, features and every screen's behaviour stay exactly as they are.

## Technical detail

- `src/routes/admin.tsx` — header restructure: mobile row becomes `menu · title · search-icon · bell · avatar`; remove the header `Back to site` Link; add `View website` item to `ProfileMenu` dropdown (opens `/` in a new tab when `display-mode: standalone`, same tab otherwise).
- New `src/components/admin/MobileTabBar.tsx` — fixed bottom bar, `lg:hidden`, 5 tabs wired to existing routes, unread counts from the same notifications hook the bell uses, safe-area padding (`env(safe-area-inset-bottom)`) so it clears the iPhone home indicator; content area gets matching bottom padding on phones.
- Drawer (`renderSidebar` mobile instance) — target height 44px rows, `py-3` rhythm, section label styling, active item uses the existing `--crm-primary` token, enter/exit transform transition.
- Spacing tokens only (`--crm-*` semantic tokens already in `src/styles.css`) — no hardcoded colours; dark mode unaffected.
- Standalone detection reuses the existing `useInstallPrompt` logic.
- Verify on a 390px phone viewport across Dashboard, Requests, Messages, Settings: header fits one row, tab bar navigates, drawer opens/closes cleanly, no "Back to site" visible, desktop (1280px) unchanged.
- Not published without your say-so.
