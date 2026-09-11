# Admin chart visual upgrade

## Goal
Make dashboard and Traffic charts easier to scan, more expressive, and more colorful while preserving every existing query and value.

## Changes
- Upgrade dashboard metric sparklines with accessible color variants, area fills, endpoint markers, and clearer scale treatment.
- Replace thin Traffic bars with richer ranked bars that show labels, values, proportions, and supporting notes clearly on desktop and mobile.
- Improve daily activity charts with grid lines, date/value tooltips, clearer visual grouping, and distinct CEVONS palette colors for live analytics, requests, and historical snapshots.
- Keep all figures sourced from the current real datasets; no fabricated metrics or backend changes.
- Verify the dashboard and Traffic screen in desktop and mobile preview, then confirm tests and the preview build.

## Technical details
- Extend existing shared admin chart primitives in `Manifest.tsx` and update Traffic presentation in `admin.traffic.tsx`.
- Add semantic chart tokens and scoped responsive/motion styling in `styles.css`.
- Preserve reduced-motion behavior and text alternatives for chart accessibility.
