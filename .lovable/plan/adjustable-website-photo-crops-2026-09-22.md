# Adjustable website photo crops

## What will change
- Add a visual crop-position editor to each photo in the Media section.
- Let editors drag the photo and use a zoom-style focal control, with reset and save actions.
- Apply the saved position only where the photo is cropped on the public website; admin thumbnails remain unchanged.
- Keep the original uploaded image intact so crop adjustments are reversible.

## Draft photo privacy
- Keep published media available to website visitors.
- Require staff access for unpublished media files and draft site-image replacements.
- Preserve existing upload, replace, publish, unpublish, scheduling, and gallery behavior.

## Technical details
- Store normalized horizontal and vertical focal points on media records.
- Use the focal point as CSS `object-position` in the public slideshow, gallery, and announcement images.
- Replace the broad media-file read rule with a rule that permits anonymous reads only when the file is referenced by a currently published media item or a live site image; staff retain access to every media file.
- Verify the editor and public result at phone and desktop sizes, then run the existing checks and security scan.
