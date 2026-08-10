CREATE TABLE public.site_images (
  slot text PRIMARY KEY,
  image_path text NOT NULL,
  image_w integer,
  image_h integer,
  alt text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site images are publicly readable"
  ON public.site_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Staff can insert site images"
  ON public.site_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update site images"
  ON public.site_images FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete site images"
  ON public.site_images FOR DELETE
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- Alt text is an accessibility requirement, enforced in the database too.
ALTER TABLE public.site_images
  ADD CONSTRAINT site_images_alt_not_blank CHECK (btrim(alt) <> '');
ALTER TABLE public.site_images
  ADD CONSTRAINT site_images_path_not_blank CHECK (btrim(image_path) <> '');

-- Replacing a live site photo is a PUBLISH action: same guard as page_sections.
CREATE OR REPLACE FUNCTION public.tg_site_images_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.can_publish(auth.uid()) THEN
    RAISE EXCEPTION 'Your role cannot change images on the public site';
  END IF;
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tg_site_images_guard_del()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.can_publish(auth.uid()) THEN
    RAISE EXCEPTION 'Your role cannot change images on the public site';
  END IF;
  RETURN OLD;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.tg_site_images_guard() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_site_images_guard_del() FROM anon, authenticated;

CREATE TRIGGER trg_site_images_guard
BEFORE INSERT OR UPDATE ON public.site_images
FOR EACH ROW EXECUTE FUNCTION public.tg_site_images_guard();

CREATE TRIGGER trg_site_images_guard_del
BEFORE DELETE ON public.site_images
FOR EACH ROW EXECUTE FUNCTION public.tg_site_images_guard_del();