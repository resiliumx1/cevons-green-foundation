ALTER TABLE public.report_templates
  ADD COLUMN IF NOT EXISTS letterhead_path text,
  ADD COLUMN IF NOT EXISTS letterhead_mode text NOT NULL DEFAULT 'all-pages';

ALTER TABLE public.report_templates
  DROP CONSTRAINT IF EXISTS report_templates_letterhead_mode_check;

ALTER TABLE public.report_templates
  ADD CONSTRAINT report_templates_letterhead_mode_check
  CHECK (letterhead_mode IN ('first-page', 'all-pages'));