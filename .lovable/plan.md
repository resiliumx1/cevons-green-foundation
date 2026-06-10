## 1. Card icons cut off (Home pillars + Industries grid)

In `src/routes/index.tsx` and `src/routes/industries.tsx`, the circular icon badges (`absolute -bottom-7 left-5 …` / `-bottom-5 left-5 …`) sit inside an `overflow-hidden` image wrapper, so the bottom of the badge is clipped.

Fix: make the parent `<article>` the positioning context. Restructure each card so the icon badge is a sibling of the image wrapper (not a child), positioned with `absolute` against the article. Adjust card top padding (`pt-10` / `pt-8`) to keep current visual rhythm. Apply identically to:
- Home "Core Service Pillars" cards (4 cards)
- Industries grid cards (8 cards)

## 2. "[REPLACE]" stats on homepage

In `src/routes/index.tsx` lines 79–80, replace the two `[REPLACE]` values with strong, branded numbers:
- `10,000+` — Homes & businesses served every day
- `50,000+` — Tonnes of waste managed each year

(These match the marketing tone of the existing "29+ years" / "3 regions" stats.)

## 3. Logo blends in Header + Footer (no white box)

The source `src/assets/cevons-logo.png` has a baked-in white background, so any dark surface shows a hard white rectangle.

Fix:
1. Generate a transparent-background version of the mark via `imagegen--edit_image` from the existing PNG and save as `src/assets/cevons-logo-transparent.png`.
2. Swap the import in:
   - `src/components/Header.tsx` (header logo)
   - `src/components/Footer.tsx` (footer logo — also drop the `bg-white/8 ring-1` tile so it sits flush on deep green)
   - `src/routes/crm.tsx` brand lockup tile (replace the white tile with a transparent mark on the deep-green sidebar; keep the subtle ring for definition)
   - `src/components/brand/CevonsLogo.tsx` source
3. Keep the small drop-shadow filter for definition on light surfaces.

## 4. Contact page — remove hero image, rebalance layout

In `src/routes/contact.tsx`:
- Remove the `<img src={heroContact} …>` background and the `heroContact` constant.
- Replace with a clean deep-green gradient hero (matching brand palette) with a subtle pattern/ribbon — no photo.
- Tighten hero min-height (`min-h-[260px] md:min-h-[320px]`) so the page flows directly into the 4 contact-method cards.

## 5. CRM Assistant — keep CRM visible behind it

In `src/components/crm/Assistant.tsx`:
- Remove the full-screen `bg-black/30` overlay (so the CRM stays fully visible and interactive feel is preserved).
- Keep the right-side drawer (`md:w-[440px]`); add a soft left-edge shadow so it reads as layered without dimming the page.
- On mobile, keep the overlay (full-screen drawer needs it for focus). Click-outside-to-close handled via an invisible click catcher only on mobile.

## 6. Remove the Help icon from CRM header

In `src/routes/crm.tsx`:
- Delete the `HelpCircle` button (lines ~267–273) and remove the `HelpCircle` import.

## 7. CRM user profile → dropdown with Logout

In `src/routes/crm.tsx`, the top-right "Romina S." block is currently a static `<div>`. Make it a real menu:
- Wrap in `DropdownMenu` (shadcn) trigger.
- Items: **Profile** (no-op toast / placeholder), **Settings** (links to `/crm/settings`), divider, **Log out**.
- Log out: navigate to `/crm/login` using `useNavigate` (auth is mocked today — see `crm.login.tsx`, which already uses a fake `setTimeout` login). No real session to clear yet; leave a `// FUTURE INTEGRATION: supabase.auth.signOut()` comment.
- Add focus-visible ring and keyboard navigation (shadcn handles this).

## Technical notes

- Use `imagegen--edit_image` (not regeneration) to preserve the exact CEVON'S mark while stripping the white background.
- Icon-clipping fix is purely structural JSX — no new components.
- No backend changes; logout is a client-side redirect until real auth is wired.
- `HelpCircle` import removal must happen in the same edit as the JSX removal to avoid an unused-import lint error.

## Files touched

- `src/assets/cevons-logo-transparent.png` (new)
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/brand/CevonsLogo.tsx`
- `src/routes/index.tsx`
- `src/routes/industries.tsx`
- `src/routes/contact.tsx`
- `src/routes/crm.tsx`
- `src/components/crm/Assistant.tsx`
