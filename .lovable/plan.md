# CEVONS Website Admin visual-system redesign

## Goal
Transform the existing admin into the selected **Modern dashboard redesign**: a bright, precise CEVONS operations workspace using Inter, deep navy, warm orange, white surfaces, fine borders, compact data density, and restrained motion. Preserve every route, permission, workflow, real data source, notification behavior, and mobile interaction.

## 1. Establish the shared admin design system
- Replace the current mixed display/mono utility styling with Inter throughout the admin, while leaving the public website typography untouched.
- Define semantic admin tokens for background, surfaces, borders, text hierarchy, orange interaction states, navy structure, semantic statuses, focus rings, shadows, radii, spacing, and motion in the existing theme layer.
- Keep light mode as the default and rebuild dark-mode mappings with equivalent contrast and hierarchy.
- Standardize reusable admin primitives: buttons, icon buttons, panels, metric cards, status badges, page/section headers, search and filter controls, fields, notices, skeletons, empty/error states, and table framing.
- Use 16px cards, 10–12px controls, an 8px spacing rhythm, consistent 16–20px icons, and visible keyboard focus.

## 2. Redesign the shared shell and navigation
- Rework the existing admin shell into the selected light-sidebar composition using the real CEVONS logo and current navigation groups/routes.
- Add soft-orange active navigation, consistent 40–44px targets, cleaner grouping, restrained count badges, and a refined collapsed state.
- Redesign the top command bar around the existing global search, Assistant, notifications, back-to-site, theme, and profile controls.
- Preserve the current desktop collapse, tablet adaptation, and mobile drawer behavior; improve spacing and touch targets rather than changing navigation logic.
- Retain the Guyana/CEVONS identity with a compact “Cleaner, Greener, Guyana” brand panel that does not compete with work content.

## 3. Make the dashboard the reference implementation
- Strengthen the welcome/header hierarchy and demote date/location metadata.
- Rebuild Quick Actions as uniform action cards with icon containers, concise supporting text, arrows, and subtle hover/press feedback.
- Replace the large dark KPI strip with four compact metric cards backed by current dashboard data.
- Add lightweight animated SVG sparklines derived from available real trend data; where a metric has no time series, show a truthful static supporting state rather than fabricated points.
- Respect reduced-motion preferences and keep sparkline animation decorative and non-blocking.
- Recompose latest requests and recent activity into the selected dense two-column operational layout, retaining all current links and records.
- Convert backend service slugs to existing human-readable service labels in presentation only.

## 4. Standardize tables, filters, forms, and states
- Apply a shared professional table system to Requests, Messages, Traffic, Pages, Images, Media, Promotions, People, Connections, and Activity Log.
- Standardize 52–60px desktop rows, clickable references, column alignment, filter/search bars, selection controls, pagination, action menus, and bulk-action feedback.
- Preserve the existing mobile table adaptation, using condensed rows/cards only where a table cannot remain readable.
- Consolidate status styling into one semantic badge system for new, review, assigned, progress, completed, priority, draft, published, and error states.
- Normalize inputs, selects, textareas, upload areas, date controls, field groups, dialogs, confirmations, and validation messaging across all admin forms.
- Unify loading, empty, permission, unavailable, and error states without changing the conditions or data logic that produce them.

## 5. Redesign notifications and live-arrival presentation
- Rebuild the existing notification interface as an accessible 420–480px desktop drawer and near-fullscreen mobile sheet.
- Preserve current notification data and actions while adding a clear header, unread count, settings, mark-all-read, close control, category filters, and date grouping where supported by existing data.
- Use subtle warm unread rows, white read rows, semantic category icons, timestamps, orange unread dots, and contextual actions.
- Restyle the existing real-time notification toast into the selected top-right CEVONS card treatment with responsive near-full-width mobile layout.
- Keep live subscriptions, links, read state, and push behavior unchanged.

## 6. Roll the system through every admin screen
- Apply the shared system to Dashboard, Traffic, Pages, Images, Media, Promotions, Requests, Messages, People, Connections, Activity Log, Settings, and request detail views.
- Refactor repeated local visual patterns into shared components where this reduces drift, especially status badges, fields, notices, thumbnails, metric cards, headers, and table controls.
- Restyle command palette, Assistant, dialogs, drawers, upload/progress states, settings tabs, role controls, analytics reports, and auth/reset screens to match the same product family.
- Do not alter backend fields, routing, authentication, permissions, request processing, analytics, CES integration, editor behavior, or notification delivery.

## 7. Responsive, motion, and accessibility pass
- Validate desktop density, tablet sidebar behavior, and mobile navigation, forms, tables, sheets, selection bars, and toast placement.
- Use restrained 120–160ms control feedback, 180–240ms standard transitions, and 240–320ms overlays with the requested easing.
- Add purposeful motion for selection, overlays, tabs, status updates, notifications, and loading only; disable nonessential animation under reduced motion.
- Verify contrast, focus visibility, semantic controls, icon-only labels, keyboard navigation, 40–44px primary targets, text wrapping, and non-overlap at compact widths.

## 8. Verification and consistency review
- Exercise the real admin routes and key interactions in browser preview at desktop and mobile sizes.
- Verify search, navigation, theme switching, notification drawer/toasts, filters, tables, forms, dialogs, selection actions, and responsive layouts still work with live data.
- Run focused tests plus the project typecheck and build checks.
- Inspect the final system for token drift in orange shades, typography, spacing, radii, shadows, borders, icon sizing, button heights, row heights, and states; fix inconsistencies before completion.
- Leave the finished redesign in preview and do not publish automatically.

## Technical approach
- Primary seams: `src/styles.css`, the admin shell, existing `Manifest` primitives, CRM motion wrappers, notifications, command palette, and route-level presentation.
- Keep TanStack routing, Lovable Cloud access, and server functions untouched.
- Use semantic tokens and existing shadcn/Radix controls rather than hardcoded per-page colors or custom accessibility behavior.
- Implement the selected prototype’s composition, but correct prototype-only excesses: use the requested 16px card radius instead of oversized 2rem radii, fine borders instead of glass effects, the real logo, real routes, and real metrics.
