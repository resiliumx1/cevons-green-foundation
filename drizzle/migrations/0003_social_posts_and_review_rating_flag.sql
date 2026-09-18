CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platforms text[] NOT NULL DEFAULT '{}',
  caption text NOT NULL DEFAULT '',
  image_path text,
  image_w integer,
  image_h integer,
  link_url text,
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  posted_at timestamptz,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_posts_status_check CHECK (status IN ('draft','scheduled','posted','cancelled')),
  CONSTRAINT social_posts_platforms_check CHECK (platforms <@ ARRAY['tiktok','facebook','instagram']::text[])
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_posts TO authenticated;
GRANT ALL ON public.social_posts TO service_role;

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_select_social_posts ON public.social_posts
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_social_posts ON public.social_posts
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_social_posts ON public.social_posts
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_social_posts ON public.social_posts
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER social_posts_set_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX social_posts_scheduled_at_idx ON public.social_posts (scheduled_at);

-- Reviews reaching the Alerts tab are flagged by their rating, so a poor
-- review is obvious without opening it.
CREATE OR REPLACE FUNCTION public.tg_notify_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flag text;
BEGIN
  IF public.notif_pref_enabled('review') THEN
    flag := CASE
      WHEN NEW.rating IS NULL THEN 'New review'
      WHEN NEW.rating <= 2 THEN 'Poor review (' || NEW.rating::text || '★)'
      WHEN NEW.rating = 3 THEN 'Mixed review (3★)'
      ELSE 'Positive review (' || NEW.rating::text || '★)'
    END;
    INSERT INTO public.notifications(type, title, body, link)
    VALUES (
      'review',
      flag || COALESCE(' from ' || NEW.reviewer_name, ''),
      COALESCE(left(NEW.body, 160), ''),
      '/admin/reviews'
    );
  END IF;
  RETURN NEW;
END
$$;