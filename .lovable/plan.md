# Fix the "API KEY REQUIRED" watermark on the branch maps

## What is happening

The maps on the Locations and Contact pages are drawn with free background map imagery from CARTO. CARTO has started stamping "API KEY REQUIRED / carto.com/basemaps/apikey" diagonally across the tiles it serves to accounts without a key. Confirmed by fetching a tile directly — it comes back with the watermark baked into the image. Nothing is broken in the site itself: the map, pins, popups and branch data all work.

## Fix

Swap the background imagery to OpenStreetMap's standard tiles, which are free, need no account or key, and carry no watermark. The map keeps its current look, size, pins, popups, scroll behaviour and placement — only the background imagery source changes, along with the required credit line under the map ("© OpenStreetMap contributors").

Applies to both places the map appears (Locations and Contact) because they share one map component.

## Verification

Load Locations and Contact in a real browser at both desktop and phone widths, confirm the tiles arrive without the watermark and the pins/popups still work, and check no errors appear.

## If you prefer a different look

OpenStreetMap's standard style is slightly more colourful than the current pale grey. Two alternatives, only if you want them later:

- Create a free CARTO account and supply an API key — keeps today's exact pale style.
- Use Google Maps instead — a heavier change to the map component and a separate connection setup.

Recommendation: go with OpenStreetMap now, since it removes the watermark today with no accounts or ongoing cost.

## Technical details

- `src/components/GuyanaBranchMapInner.tsx`: change the `TileLayer` `url` from `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` to `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, update `attribution` to the OpenStreetMap credit, and set `maxZoom` within the provider's supported range.
- No changes to `GuyanaBranchMap.tsx` lazy-loading, the Leaflet CSS strategy, branch data, or any page layout.
