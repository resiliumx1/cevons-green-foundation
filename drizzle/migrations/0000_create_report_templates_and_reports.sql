-- AI-assisted reporting for the admin area.

CREATE TABLE public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  accent_color text NOT NULL DEFAULT '#EA6A00',
  heading_color text NOT NULL DEFAULT '#0B2545',
  header_text text NOT NULL DEFAULT '',
  subheader_text text NOT NULL DEFAULT '',
  footer_text text NOT NULL DEFAULT '',
  logo_path text,
  page_size text NOT NULL DEFAULT 'A4',
  font_family text NOT NULL DEFAULT 'helvetica',
  show_page_numbers boolean NOT NULL DEFAULT true,
  cover_page boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  template_id uuid REFERENCES public.report_templates(id) ON DELETE SET NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  sources text[] NOT NULL DEFAULT '{}',
  brief text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{"sections":[]}'::jsonb,
  facts jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  pdf_path text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reports_created_at_idx ON public.reports (created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_templates TO authenticated;
GRANT ALL ON public.report_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read report templates" ON public.report_templates
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff create report templates" ON public.report_templates
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update report templates" ON public.report_templates
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete report templates" ON public.report_templates
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff read reports" ON public.reports
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff create reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update reports" ON public.reports
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete reports" ON public.reports
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER report_templates_updated_at BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.report_templates (name, header_text, subheader_text, footer_text, is_default)
VALUES ('CEVONS standard', 'CEVONS Environmental Services', 'Georgetown, Guyana', 'Prepared with CEVONS admin', true);
