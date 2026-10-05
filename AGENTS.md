# Project architecture rules

- Load published site-image replacements in the root route before SSR so originals never flash before saved photos; keep draft URLs gated by verified preview tokens.- Database-triggered calls (CES drain, push fan-out) authenticate with a DB-generated key in private.app_keys, verified server-side via check_ces_drain_token; the vault and service-role key are not used for this. Why: the vault was empty and silently blocked delivery.

- Only content-versioned URLs (Vite-hashed filenames, /__l5e/, /_build/) get immutable caching; files from public/ get a short cache, so a changed public image must get a new filename. Why: unversioned names marked immutable would serve stale files for a year.
- The homepage slideshow advances on a timer with a CSS progress bar and loads only the first slide up front, then each next slide just ahead of use. Why: per-frame React state and eager slide loading hurt load speed and responsiveness.
- Google Business Profile reads and replies stay in staff-only server functions, and every live reply requires explicit confirmation. Why: connector credentials must remain private and review replies are public actions.
