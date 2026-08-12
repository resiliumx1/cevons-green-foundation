-- content_strings: allow anon to read only the public columns
CREATE POLICY "Anon can read content strings"
  ON public.content_strings FOR SELECT TO anon
  USING (true);
GRANT SELECT (key, page, section, label, published_value, max_length, multiline, updated_at) ON public.content_strings TO anon;

-- page_sections: column-scoped anon access (no draft_payload)
REVOKE SELECT ON public.page_sections FROM anon;
GRANT SELECT (id, page, kind, "position", payload, published, created_at, updated_at, updated_by) ON public.page_sections TO anon;

DROP VIEW IF EXISTS public.public_page_sections;
