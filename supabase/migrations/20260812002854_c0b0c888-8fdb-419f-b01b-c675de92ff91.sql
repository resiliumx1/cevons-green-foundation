ALTER TABLE public.site_images DROP CONSTRAINT site_images_alt_not_blank;
ALTER TABLE public.site_images ADD CONSTRAINT site_images_alt_not_blank
  CHECK (image_path IS NULL OR btrim(alt) <> '');

INSERT INTO public.site_images (slot, draft_image_path, draft_image_w, draft_image_h, draft_alt)
VALUES ('svc_skip_bin_size_10', 'site-images/test/draft-check.webp', 1600, 900, 'draft check')
ON CONFLICT (slot) DO UPDATE SET draft_image_path = excluded.draft_image_path;