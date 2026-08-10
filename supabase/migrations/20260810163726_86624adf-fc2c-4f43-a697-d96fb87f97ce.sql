-- 1. Tables ---------------------------------------------------------------

CREATE TABLE public.content_strings (
  key text PRIMARY KEY,
  page text NOT NULL,
  section text NOT NULL,
  label text NOT NULL,
  published_value text,
  draft_value text,
  max_length int,
  multiline boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.content_string_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  previous_value text,
  replaced_at timestamptz NOT NULL DEFAULT now(),
  replaced_by uuid
);

CREATE INDEX content_strings_page_section_idx ON public.content_strings (page, section);
CREATE INDEX content_string_versions_key_idx ON public.content_string_versions (key, replaced_at DESC);

-- 2. Grants ----------------------------------------------------------------
-- NOTE: anon gets NO grant on the base tables. Public reads go exclusively
-- through the security-definer view below, which exposes published_value only.

GRANT SELECT, UPDATE ON public.content_strings TO authenticated;
GRANT ALL ON public.content_strings TO service_role;

GRANT SELECT ON public.content_string_versions TO authenticated;
GRANT ALL ON public.content_string_versions TO service_role;

-- 3. RLS -------------------------------------------------------------------

ALTER TABLE public.content_strings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_string_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read content strings"
  ON public.content_strings FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update content strings"
  ON public.content_strings FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can read content string versions"
  ON public.content_string_versions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- No INSERT/UPDATE/DELETE policy on content_string_versions: rows are written
-- only by the SECURITY DEFINER publish trigger below.

-- 4. Public view (published_value only) ------------------------------------
-- security_invoker is left OFF (default), so the view runs as its owner and
-- bypasses the base table's RLS while exposing only two safe columns.

CREATE VIEW public.public_content_strings AS
  SELECT key, published_value
  FROM public.content_strings;

GRANT SELECT ON public.public_content_strings TO anon, authenticated;

-- 5. Publish guard + version trigger ---------------------------------------

CREATE OR REPLACE FUNCTION public.tg_content_strings_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.published_value IS DISTINCT FROM OLD.published_value THEN
    IF NOT public.can_publish(auth.uid()) THEN
      RAISE EXCEPTION 'Your role can save drafts but cannot publish';
    END IF;
    INSERT INTO public.content_string_versions (key, previous_value, replaced_by)
    VALUES (OLD.key, OLD.published_value, auth.uid());
  END IF;

  -- Structural columns are code-owned, not editor-owned.
  NEW.key := OLD.key;
  NEW.page := OLD.page;
  NEW.section := OLD.section;
  NEW.max_length := OLD.max_length;
  NEW.multiline := OLD.multiline;

  IF NEW.max_length IS NOT NULL THEN
    IF length(coalesce(NEW.draft_value, '')) > NEW.max_length
       OR length(coalesce(NEW.published_value, '')) > NEW.max_length THEN
      RAISE EXCEPTION 'Value exceeds the % character limit for %', NEW.max_length, OLD.key;
    END IF;
  END IF;

  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_strings_guard
  BEFORE UPDATE ON public.content_strings
  FOR EACH ROW EXECUTE FUNCTION public.tg_content_strings_guard();

REVOKE EXECUTE ON FUNCTION public.tg_content_strings_guard() FROM PUBLIC, anon;