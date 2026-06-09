
-- 1. Extend service_requests
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS customer_id uuid,
  ADD COLUMN IF NOT EXISTS estimated_value numeric,
  ADD COLUMN IF NOT EXISTS lost_reason text,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- updated_at trigger function (shared)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER trg_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. CRM tables

-- customers
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text CHECK (type IN ('residential','commercial','industrial')),
  contact_name text,
  email text,
  phone text,
  region text,
  address text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon, authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_customers" ON public.customers IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- activities
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  related_type text NOT NULL CHECK (related_type IN ('lead','customer','job')),
  related_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('note','call','whatsapp','sms','email','status_change')),
  direction text CHECK (direction IN ('inbound','outbound')),
  body text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO anon, authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_activities" ON public.activities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_activities" ON public.activities IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';

-- quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  service_request_id uuid,
  customer_id uuid,
  title text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric,
  tax numeric,
  total numeric,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','declined','expired')),
  valid_until date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO anon, authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_quotes" ON public.quotes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_quotes" ON public.quotes IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
DROP TRIGGER IF EXISTS trg_quotes_updated_at ON public.quotes;
CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  service_request_id uuid,
  customer_id uuid,
  quote_id uuid,
  service text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  assigned_to text,
  region text,
  address text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO anon, authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_jobs" ON public.jobs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_jobs" ON public.jobs IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  customer_id uuid,
  job_id uuid,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric,
  tax numeric,
  total numeric,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','void')),
  issued_date date,
  due_date date,
  paid_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO anon, authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_invoices" ON public.invoices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_invoices" ON public.invoices IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid,
  reviewer_name text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  body text,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','google','facebook')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('pending','published','responded','hidden')),
  response text,
  review_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_reviews" ON public.reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_reviews" ON public.reviews IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
DROP TRIGGER IF EXISTS trg_reviews_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel text CHECK (channel IN ('google_ads','facebook','whatsapp','referral','organic','other')),
  utm_campaign text,
  start_date date,
  end_date date,
  cost numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO anon, authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_campaigns" ON public.campaigns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_campaigns" ON public.campaigns IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- crm_settings
CREATE TABLE IF NOT EXISTS public.crm_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_settings TO anon, authenticated;
GRANT ALL ON public.crm_settings TO service_role;
ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temp_anon_all_crm_settings" ON public.crm_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_crm_settings" ON public.crm_settings IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
DROP TRIGGER IF EXISTS trg_crm_settings_updated_at ON public.crm_settings;
CREATE TRIGGER trg_crm_settings_updated_at BEFORE UPDATE ON public.crm_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add temporary anon policy on service_requests for CRM access
DROP POLICY IF EXISTS "temp_anon_all_service_requests" ON public.service_requests;
CREATE POLICY "temp_anon_all_service_requests" ON public.service_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
COMMENT ON POLICY "temp_anon_all_service_requests" ON public.service_requests IS 'TEMPORARY — replace with authenticated-only when CRM login is added.';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO anon;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_region ON public.service_requests(region);
CREATE INDEX IF NOT EXISTS idx_service_requests_utm_source ON public.service_requests(utm_source);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_start ON public.jobs(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_related ON public.activities(related_type, related_id);
