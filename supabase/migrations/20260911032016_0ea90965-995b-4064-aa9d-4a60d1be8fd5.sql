-- Restore the email queue helper functions referenced by migration
-- 20260812122947 (REVOKE/GRANT on public.email_queue_dispatch() and
-- public.email_queue_wake()). They were originally created by dynamic
-- post-migration setup steps, so a fresh replay of the migration chain
-- fails with "function does not exist". Defining them here makes the
-- chain self-contained. The transactional dispatch path now sends email
-- directly (see src/routes/api/public/notify/dispatch.ts), so dispatch
-- is intentionally a no-op; wake() remains for cron compatibility.

CREATE OR REPLACE FUNCTION public.email_queue_dispatch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Queue-based dispatch was replaced by direct sending in the
  -- notify/dispatch route; nothing to do.
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.email_queue_wake()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.email_queue_dispatch();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_wake() TO service_role;