-- Restore Data API privileges for editable public content after migration replay.
-- RLS policies continue to determine which rows each role may access.

REVOKE ALL PRIVILEGES ON TABLE public.page_sections FROM anon;
GRANT SELECT (id, page, kind, "position", payload, published, created_at, updated_at, updated_by)
  ON TABLE public.page_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.page_sections TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.page_sections TO service_role;

REVOKE ALL PRIVILEGES ON TABLE public.site_images FROM anon;
GRANT SELECT (slot, image_path, image_w, image_h, alt, updated_at)
  ON TABLE public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_images TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.site_images TO service_role;