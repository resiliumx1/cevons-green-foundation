-- 1. Pin search_path on email queue helpers
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;

-- 2. Revoke public/anon execute on SECURITY DEFINER internals
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;

-- 3. content_strings: remove the all-columns public read policy (public reads go through the published-only view)
DROP POLICY IF EXISTS "Anyone can read published content strings" ON public.content_strings;
REVOKE SELECT ON public.content_strings FROM anon;

-- 4. page_sections: published-only view without draft columns
CREATE OR REPLACE VIEW public.public_page_sections
WITH (security_invoker = true) AS
SELECT id, page, kind, "position", payload, published, updated_at
FROM public.page_sections
WHERE published = true;

GRANT SELECT ON public.public_page_sections TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read published page sections" ON public.page_sections;
CREATE POLICY "Anon can read published page sections"
  ON public.page_sections FOR SELECT TO anon
  USING (published = true);
