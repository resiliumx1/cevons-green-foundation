# Media photo fitting, crop preview, and scheduling clarity

## What will change

- Add a photo-preparation screen immediately after choosing an image, before it is uploaded or replaces an existing photo.
- Show the photo inside the exact website-shaped frame for its media type, with three clear choices:
  - **Fill box** — automatically fills the frame and lets the editor reposition the important area.
  - **Fit whole photo** — keeps the entire image visible without cropping.
  - **Custom crop** — lets the editor zoom and reposition the image before saving.
- Keep the original uploaded image protected; the saved settings control how the website presents it.
- Upgrade the existing crop editor to show both desktop and mobile previews where applicable, plus reset and cancel actions.
- Make each media item’s state immediately visible with a prominent status panel: Draft, Scheduled, Live, Ended, or Outside schedule.
- Improve date controls with calendar/clock icons, clear Georgetown time labels, formatted schedule summaries, validation when the end precedes the start, and one-click date clearing.
- Keep publishing separate and explicit: setting dates will not publish a draft, and the existing permissions remain unchanged.

## Technical details

- Add presentation settings to media records for fit mode and zoom, with safe defaults preserving current published images.
- Apply the selected fit, focal point, and zoom consistently in the homepage slideshow and News & Media images.
- Reuse the existing upload optimisation and storage flow; no new dependency is needed.
- Verify the Media screen at phone and desktop sizes, including upload preparation, crop preview, scheduling states, and public image rendering.
- Do not publish the website.
