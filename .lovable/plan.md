# Refine media cropping and action feedback

## Goal
Make photo positioning feel familiar and precise on desktop and mobile, while preserving every existing media card, website layout, original upload, and publishing workflow.

## Changes
- Keep the existing **Fill**, **Fit whole photo**, and **Custom crop** choices, but make their selected states and purpose clearer.
- Upgrade Custom crop to support direct drag/pan, touch gestures, keyboard nudging, and accessible controls without adding a dependency.
- Add practical crop tools: zoom buttons plus slider, centered reset, focal-point readout, and a clear preview boundary/grid.
- Keep both desktop and phone previews for slideshow photos and apply the same saved crop settings everywhere the image appears.
- Constrain zoom and position safely so custom settings cannot resize cards, overflow the dialog, or alter the public page structure.
- Add subtle vibration feedback on supported mobile devices for replace/add, crop, reset, save, publish/unpublish, reorder, and delete actions; unsupported devices remain unaffected.
- Pair vibration with a short press animation so feedback still works visually and respects reduced-motion preferences.

## Verification
- Test crop selection, dragging, touch interaction, zoom, reset, save, and cancel at desktop and phone sizes.
- Confirm saved Fill/Fit/Custom settings render correctly in the admin preview and public media locations.
- Confirm media actions still work, no content is covered or shifted, and the latest preview build has no errors.

## Technical details
- Use Pointer Events with pointer capture for mouse, pen, and single-touch panning.
- Use the browser vibration capability only after direct user actions and feature-detect it first.
- Keep all visual feedback token-based and reuse the existing button components and motion utility.
