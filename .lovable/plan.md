# Request a Service — Look & Feel Polish (Premium navy & orange)

Visual refresh of the booking wizard and its entry buttons. **No step, flow, icon, or content changes** — the wizard steps, the existing category/service icons, and the animated truck progress element at the top all stay exactly as they are.

## What changes

**Wizard selection tiles (categories + services)**
- Darker navy icon tiles with white icons, soft navy shadow — much stronger contrast against white cards (current pale-green tiles read washed out).
- Labels in bold navy (or stronger charcoal on unselected) instead of muted grey-green, with subtle uppercase tracking for readability.
- Unselected tiles get a soft "glass" feel: semi-white surface, faint border, gentle shadow; hover lifts slightly and warms the border.
- Selected tile: navy border + tint, small check, orange accent ring.
- "Haptic" tap feedback: quick scale-down on press, smooth spring back — on tiles and buttons.

**Request a Service / Book now buttons (hero, header, navigation)**
- Warm orange with a soft orange glow.
- Gentle 3-second idle pulse (scale 1 → 1.02) plus a light shine sweep across the button.
- Hover: lifts with a bigger glow; press: quick scale-down.
- Respects reduced-motion settings.

**Wizard stepper & layout polish**
- Keep the truck progress — just refresh its surface: glassy progress bar with a glowing orange fill and soft shadow behind the truck.
- Slightly stronger step labels (navy for current, readable grey for upcoming).
- Overall spacing rhythm tidied; wizard card gets a soft navy-shadowed border so it feels premium.

## What does not change
- Wizard steps, order, fields, validation, submission, CES/email delivery.
- The icons themselves and the truck animation behavior.
- Public pages other than the button/tile styling and wizard presentation.

## Technical notes
- Files: `src/components/RequestServiceWizard.tsx`, `src/components/Header.tsx`, plus the hero/footer CTA button variants in `src/components/ui/button.tsx` and small tokens/keyframes in `src/styles.css`.
- New CSS keyframes: `cta-pulse`, `cta-shine`, `tap-spring` (all with `prefers-reduced-motion` fallbacks).
- Glass effect via `backdrop-blur` + translucent white; falls back gracefully where unsupported.
- Verify with Playwright on desktop and phone viewports: contrast of tiles, button animation, truck stepper intact, no layout overflow.
