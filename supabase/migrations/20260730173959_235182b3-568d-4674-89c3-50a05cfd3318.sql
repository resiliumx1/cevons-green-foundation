CREATE TABLE public.media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL CHECK (kind IN ('slide','gallery','announcement')),
  title text NOT NULL DEFAULT '',
  caption text DEFAULT '',
  image_path text,
  image_w int,
  image_h int,
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

GRANT SELECT ON public.media_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_posts TO authenticated;
GRANT ALL ON public.media_posts TO service_role;

CREATE INDEX media_posts_kind_published_sort_idx ON public.media_posts (kind, published, sort_order);

ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published media posts"
  ON public.media_posts FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Staff can read all media posts"
  ON public.media_posts FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert media posts"
  ON public.media_posts FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update media posts"
  ON public.media_posts FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete media posts"
  ON public.media_posts FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- Storage policies for the `media` bucket
CREATE POLICY "Public can read media bucket"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');

CREATE POLICY "Staff can upload media bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update media bucket"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete media bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()));