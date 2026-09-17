# Deep-navy admin and Reviews workspace

## Scope
- Apply the existing deep-navy glass visual language to Dashboard, Requests, and Messages without changing their routes, data, actions, filters, counts, or workflows.
- Add Reviews to the admin navigation and mobile Menu while preserving the five existing bottom tabs.
- Build a mobile-friendly Reviews screen using the existing reviews data and notification system.

## Interface changes
- Use one consistent navy glass page surface, edge highlights, soft shadows, orange accents, and readable light text across the three requested screens.
- Restyle existing summary panels, request pipeline/filter controls, message filters, lists, and empty/error states with shared semantic classes rather than changing behavior.
- Keep bottom content clearance and reduced-motion support intact.
- Present reviews in a scannable feed with reviewer, date, review text, reply status, and rating colors: positive, neutral, and critical.
- Add a focused reply area for each review. Existing saved replies remain visible.

## Google Business Profile state
- CEVONS has profile access but not approved Google Business Profile API access, and no supported app connector is available in this workspace.
- The Reviews screen will therefore show an honest setup-required state instead of fabricated live data or a reply action that cannot reach Google.
- Stored review rows can be displayed now. Live syncing and posting replies will become available only after Google approves API access and server credentials are connected.

## Technical details
- Reuse the existing `reviews` table, staff-only access rules, review notification type, admin shell, buttons, panels, and motion system.
- Add `/admin/reviews` metadata and navigation; update review notification links to target this screen if a safe migration is needed.
- Use semantic CSS tokens/classes for the glass treatment; no new dependency and no public-site changes.
- Keep Google credentials server-only when they become available; never expose them in the browser.

## Verification
- Check Dashboard, Requests, Messages, Reviews, and admin navigation at the current phone viewport and a desktop viewport.
- Confirm existing routes/actions/counts still work, content is not hidden behind the floating tab bar, reduced-motion behavior remains valid, and the build is clean.
