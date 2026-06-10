
-- 1. Friendly reference generator (no ambiguous chars)
CREATE OR REPLACE FUNCTION public.generate_request_reference()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
  attempts int := 0;
BEGIN
  LOOP
    candidate := 'CEV-' || extract(year from now())::text || '-';
    FOR i IN 1..5 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.service_requests WHERE reference = candidate);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      candidate := candidate || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1);
      EXIT;
    END IF;
  END LOOP;
  RETURN candidate;
END $$;

-- 2. Status events table
CREATE TABLE IF NOT EXISTS public.request_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.request_status_events TO authenticated;
GRANT ALL ON public.request_status_events TO service_role;

ALTER TABLE public.request_status_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_status_events" ON public.request_status_events;
CREATE POLICY "auth_read_status_events" ON public.request_status_events
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_status_events" ON public.request_status_events;
CREATE POLICY "auth_insert_status_events" ON public.request_status_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_request_status_events_request
  ON public.request_status_events(request_id, created_at);

-- 3. Trigger to log status changes
CREATE OR REPLACE FUNCTION public.tg_log_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.request_status_events(request_id, status, note)
    VALUES (NEW.id, COALESCE(NEW.status,'new'), 'Request received');
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_events(request_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_service_requests_status_log ON public.service_requests;
CREATE TRIGGER tg_service_requests_status_log
AFTER INSERT OR UPDATE OF status ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.tg_log_status_change();

-- 4. Updated submit function – uses new reference generator
CREATE OR REPLACE FUNCTION public.submit_service_request(payload jsonb)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  _ref := public.generate_request_reference();

  INSERT INTO public.service_requests (
    reference, category, service, customer_type, details, preferred_date, preferred_time,
    region, name, email, phone, company, contact_method, message, file_urls,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page
  ) VALUES (
    _ref,
    payload->>'category', payload->>'service', payload->>'customer_type',
    COALESCE(payload->'details', '{}'::jsonb),
    NULLIF(payload->>'preferred_date','')::date,
    payload->>'preferred_time', payload->>'region',
    payload->>'name', NULLIF(payload->>'email',''), payload->>'phone',
    payload->>'company', payload->>'contact_method', payload->>'message',
    COALESCE(_files, '{}'::text[]),
    payload->>'utm_source', payload->>'utm_medium', payload->>'utm_campaign',
    payload->>'utm_term', payload->>'utm_content', payload->>'referrer', payload->>'landing_page'
  );

  RETURN _ref;
END $$;
