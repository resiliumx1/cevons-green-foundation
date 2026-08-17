ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS service_branch text;

UPDATE public.service_requests SET service_branch = 'Georgetown' WHERE region = 'Georgetown';
UPDATE public.service_requests SET service_branch = NULL WHERE region = 'Other' OR region IS NULL;

CREATE OR REPLACE FUNCTION public.submit_service_request(payload jsonb)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _ref text;
  _files text[];
  _branch text;
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

  _branch := NULLIF(payload->>'service_branch', '');
  IF _branch IS NOT NULL AND _branch NOT IN ('Georgetown','Linden','Berbice') THEN
    RAISE EXCEPTION 'Invalid service branch';
  END IF;

  _ref := public.generate_request_reference();

  INSERT INTO public.service_requests (
    reference, category, service, customer_type, details, preferred_date, preferred_time,
    region, service_branch, name, email, phone, company, contact_method, message, file_urls,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, landing_page
  ) VALUES (
    _ref,
    payload->>'category', payload->>'service', payload->>'customer_type',
    COALESCE(payload->'details', '{}'::jsonb),
    NULLIF(payload->>'preferred_date','')::date,
    payload->>'preferred_time', payload->>'region', _branch,
    payload->>'name', NULLIF(payload->>'email',''), payload->>'phone',
    payload->>'company', payload->>'contact_method', payload->>'message',
    COALESCE(_files, '{}'::text[]),
    NULLIF(payload->>'utm_source',''), NULLIF(payload->>'utm_medium',''), NULLIF(payload->>'utm_campaign',''),
    NULLIF(payload->>'utm_term',''), NULLIF(payload->>'utm_content',''), NULLIF(payload->>'referrer',''),
    NULLIF(payload->>'landing_page','')
  );

  RETURN _ref;
END $function$;

REVOKE EXECUTE ON FUNCTION public.submit_service_request(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_service_request(jsonb) TO service_role;