
-- Sequence for human-readable reference numbers
CREATE SEQUENCE IF NOT EXISTS public.service_request_ref_seq START 1041;

-- service_requests
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL DEFAULT ('CEV-' || lpad(nextval('public.service_request_ref_seq')::text, 4, '0')),
  category text,
  service text,
  customer_type text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferred_date date,
  preferred_time text,
  region text,
  name text,
  email text,
  phone text,
  company text,
  contact_method text,
  message text,
  file_urls text[] NOT NULL DEFAULT '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_page text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
GRANT USAGE ON SEQUENCE public.service_request_ref_seq TO authenticated, service_role;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Only signed-in staff can read or modify rows directly
CREATE POLICY "Authenticated users can read service requests"
  ON public.service_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update service requests"
  ON public.service_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete service requests"
  ON public.service_requests FOR DELETE TO authenticated USING (true);
-- No anonymous INSERT policy — submissions flow through the SECURITY DEFINER RPC below.

-- contact_messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_page text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated USING (true);

-- Submit RPC for service requests (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.submit_service_request(payload jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ref text;
  _files text[];
BEGIN
  IF jsonb_typeof(payload->'file_urls') = 'array' THEN
    SELECT array_agg(value) INTO _files
    FROM jsonb_array_elements_text(payload->'file_urls') AS value
    WHERE length(value) < 2048;
  ELSE
    _files := '{}'::text[];
  END IF;

  -- Basic input validation
  IF coalesce(length(payload->>'name'), 0) = 0 OR length(payload->>'name') > 200 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF coalesce(length(payload->>'phone'), 0) = 0 OR length(payload->>'phone') > 40 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  IF length(coalesce(payload->>'email','')) > 320 THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  IF length(coalesce(payload->>'message','')) > 5000 THEN
    RAISE EXCEPTION 'Message too long';
  END IF;

  INSERT INTO public.service_requests (
    category, service, customer_type, details, preferred_date, preferred_time,
    region, name, email, phone, company, contact_method, message, file_urls,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page
  ) VALUES (
    payload->>'category', payload->>'service', payload->>'customer_type',
    COALESCE(payload->'details', '{}'::jsonb),
    NULLIF(payload->>'preferred_date','')::date,
    payload->>'preferred_time', payload->>'region',
    payload->>'name', NULLIF(payload->>'email',''), payload->>'phone',
    payload->>'company', payload->>'contact_method', payload->>'message',
    COALESCE(_files, '{}'::text[]),
    payload->>'utm_source', payload->>'utm_medium', payload->>'utm_campaign',
    payload->>'utm_term', payload->>'utm_content', payload->>'referrer', payload->>'landing_page'
  )
  RETURNING reference INTO _ref;

  RETURN _ref;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_service_request(jsonb) TO anon, authenticated;

-- Submit RPC for contact messages
CREATE OR REPLACE FUNCTION public.submit_contact_message(payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(length(payload->>'name'), 0) = 0 OR length(payload->>'name') > 200 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF coalesce(length(payload->>'email'), 0) = 0 OR length(payload->>'email') > 320 THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  IF coalesce(length(payload->>'message'), 0) = 0 OR length(payload->>'message') > 5000 THEN
    RAISE EXCEPTION 'Invalid message';
  END IF;

  INSERT INTO public.contact_messages (
    name, email, phone, subject, message,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page
  ) VALUES (
    payload->>'name', payload->>'email', payload->>'phone',
    payload->>'subject', payload->>'message',
    payload->>'utm_source', payload->>'utm_medium', payload->>'utm_campaign',
    payload->>'utm_term', payload->>'utm_content', payload->>'referrer', payload->>'landing_page'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_contact_message(jsonb) TO anon, authenticated;

-- Public status-lookup RPC: returns minimal non-PII fields only
CREATE OR REPLACE FUNCTION public.get_request_status(_reference text)
RETURNS TABLE(reference text, status text, service text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT reference, status, service, created_at
  FROM public.service_requests
  WHERE reference = _reference
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_request_status(text) TO anon, authenticated;
