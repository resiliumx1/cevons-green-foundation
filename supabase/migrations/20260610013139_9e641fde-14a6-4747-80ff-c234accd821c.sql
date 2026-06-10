CREATE TABLE public.utm_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT,
  base_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.utm_links TO authenticated;
GRANT ALL ON public.utm_links TO service_role;
ALTER TABLE public.utm_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view utm_links" ON public.utm_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert utm_links" ON public.utm_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update utm_links" ON public.utm_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete utm_links" ON public.utm_links FOR DELETE TO authenticated USING (true);