ALTER TABLE public.media_posts
  ADD COLUMN focal_x smallint NOT NULL DEFAULT 50,
  ADD COLUMN focal_y smallint NOT NULL DEFAULT 50;

ALTER TABLE public.media_posts
  ADD CONSTRAINT media_posts_focal_x_range CHECK (focal_x BETWEEN 0 AND 100),
  ADD CONSTRAINT media_posts_focal_y_range CHECK (focal_y BETWEEN 0 AND 100);

DROP POLICY IF EXISTS "Public can read media bucket" ON storage.objects;

CREATE POLICY "Public can read live media files"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'media'
    AND (
      EXISTS (
        SELECT 1
        FROM public.media_posts
        WHERE media_posts.image_path = storage.objects.name
          AND media_posts.published = true
          AND (media_posts.publish_at IS NULL OR media_posts.publish_at <= now())
          AND (media_posts.unpublish_at IS NULL OR media_posts.unpublish_at > now())
      )
      OR EXISTS (
        SELECT 1
        FROM public.site_images
        WHERE site_images.image_path = storage.objects.name
      )
    )
  );

CREATE POLICY "Staff can read all media files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()));