-- =========================================================
-- PAGE SECTIONS
-- =========================================================
CREATE TABLE public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  kind text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  draft_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
CREATE INDEX page_sections_page_pos_idx ON public.page_sections (page, position);

GRANT SELECT ON public.page_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published page sections"
  ON public.page_sections FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Staff can read all page sections"
  ON public.page_sections FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert page sections"
  ON public.page_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND (published = false OR public.can_publish(auth.uid())));

CREATE POLICY "Staff can update page sections"
  ON public.page_sections FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()) AND (published = false OR public.can_publish(auth.uid())));

CREATE POLICY "Staff can delete page sections"
  ON public.page_sections FOR DELETE
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER trg_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Contributors may edit drafts but never change live payload / published flag.
CREATE OR REPLACE FUNCTION public.tg_page_sections_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.can_publish(auth.uid()) THEN
    IF NEW.payload IS DISTINCT FROM OLD.payload
       OR NEW.published IS DISTINCT FROM OLD.published THEN
      RAISE EXCEPTION 'Your role can save drafts but cannot publish';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_page_sections_guard
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.tg_page_sections_guard();

-- =========================================================
-- PAGE SECTION VERSIONS
-- =========================================================
CREATE TABLE public.page_section_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.page_sections(id) ON DELETE CASCADE,
  page text NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
CREATE INDEX page_section_versions_section_idx
  ON public.page_section_versions (section_id, created_at DESC);

GRANT SELECT, INSERT ON public.page_section_versions TO authenticated;
GRANT ALL ON public.page_section_versions TO service_role;

ALTER TABLE public.page_section_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read page section versions"
  ON public.page_section_versions FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert page section versions"
  ON public.page_section_versions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- Snapshot the outgoing live payload on every publish.
CREATE OR REPLACE FUNCTION public.tg_page_sections_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.payload IS DISTINCT FROM OLD.payload AND OLD.payload <> '{}'::jsonb THEN
    INSERT INTO public.page_section_versions (section_id, page, kind, payload, created_by)
    VALUES (OLD.id, OLD.page, OLD.kind, OLD.payload, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_page_sections_version
  AFTER UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.tg_page_sections_version();

-- =========================================================
-- PROMOTIONS
-- =========================================================
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  cta_label text,
  cta_href text,
  placement text NOT NULL DEFAULT 'site_top_bar',
  target_services text[] NOT NULL DEFAULT '{}'::text[],
  palette text NOT NULL DEFAULT 'navy',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  published boolean NOT NULL DEFAULT false,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promotions_placement_chk
    CHECK (placement IN ('service_hero','site_top_bar','wizard_step')),
  CONSTRAINT promotions_palette_chk
    CHECK (palette IN ('navy','orange','green'))
);

GRANT SELECT ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read live promotions"
  ON public.promotions FOR SELECT
  TO anon, authenticated
  USING (
    published = true
    AND starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
  );

CREATE POLICY "Staff can read all promotions"
  ON public.promotions FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert promotions"
  ON public.promotions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND (published = false OR public.can_publish(auth.uid())));

CREATE POLICY "Staff can update promotions"
  ON public.promotions FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()) AND (published = false OR public.can_publish(auth.uid())));

CREATE POLICY "Staff can delete promotions"
  ON public.promotions FOR DELETE
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.tg_promotions_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.can_publish(auth.uid()) AND NEW.published IS DISTINCT FROM OLD.published THEN
    RAISE EXCEPTION 'Your role can save drafts but cannot publish';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_promotions_guard
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.tg_promotions_guard();

-- Click counter: increments ONLY click_count for one live promotion.
CREATE OR REPLACE FUNCTION public.increment_promotion_click(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.promotions
     SET click_count = click_count + 1
   WHERE id = _id
     AND published = true
     AND starts_at <= now()
     AND (ends_at IS NULL OR ends_at > now());
END;
$$;

REVOKE ALL ON FUNCTION public.increment_promotion_click(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_promotion_click(uuid) TO anon, authenticated;

-- =========================================================
-- MEDIA SCHEDULING
-- =========================================================
ALTER TABLE public.media_posts
  ADD COLUMN IF NOT EXISTS publish_at timestamptz,
  ADD COLUMN IF NOT EXISTS unpublish_at timestamptz;

DROP POLICY IF EXISTS "Public can read published media posts" ON public.media_posts;

CREATE POLICY "Public can read published media posts"
  ON public.media_posts FOR SELECT
  TO anon, authenticated
  USING (
    published = true
    AND (publish_at IS NULL OR publish_at <= now())
    AND (unpublish_at IS NULL OR unpublish_at > now())
  );
