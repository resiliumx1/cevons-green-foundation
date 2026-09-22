ALTER TABLE public.media_posts
  ADD COLUMN image_fit text NOT NULL DEFAULT 'cover',
  ADD COLUMN image_zoom smallint NOT NULL DEFAULT 100;

ALTER TABLE public.media_posts
  ADD CONSTRAINT media_posts_image_fit_allowed CHECK (image_fit IN ('cover', 'contain', 'custom')),
  ADD CONSTRAINT media_posts_image_zoom_range CHECK (image_zoom BETWEEN 100 AND 200);

COMMENT ON COLUMN public.media_posts.image_fit IS 'Website presentation mode: cover fills the frame, contain shows the whole photo, custom fills with editor-controlled zoom and focal point.';
COMMENT ON COLUMN public.media_posts.image_zoom IS 'Website presentation zoom percentage. 100 preserves the base fit; custom mode may zoom up to 200.';