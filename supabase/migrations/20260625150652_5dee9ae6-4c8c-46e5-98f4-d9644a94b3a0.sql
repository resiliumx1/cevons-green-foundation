
-- 1) Drop temp anon-all policies on CRM/ops tables and add authenticated-only ALL
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['activities','campaigns','crm_settings','customers','invoices','jobs','quotes','reviews','service_requests']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'temp_anon_all_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
                   'auth_all_' || t, t);
  END LOOP;
END$$;

-- 2) Lock down notifications and notification_preferences (was public)
DROP POLICY IF EXISTS "Open read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Open insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Open update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Open delete notifications" ON public.notifications;
CREATE POLICY "Authenticated read notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update notifications" ON public.notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete notifications" ON public.notifications FOR DELETE TO authenticated USING (true);
-- INSERT happens via SECURITY DEFINER triggers (service role), no policy needed for clients

DROP POLICY IF EXISTS "Open read prefs" ON public.notification_preferences;
DROP POLICY IF EXISTS "Open insert prefs" ON public.notification_preferences;
DROP POLICY IF EXISTS "Open update prefs" ON public.notification_preferences;
CREATE POLICY "Authenticated read prefs" ON public.notification_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert prefs" ON public.notification_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update prefs" ON public.notification_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 3) newsletter_subscribers: add authenticated-only SELECT (anon insert stays)
CREATE POLICY "Authenticated read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (true);

-- 4) Storage: add UPDATE and DELETE policies for both private buckets (authenticated staff only)
CREATE POLICY "Staff update contact attachments" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'contact-attachments') WITH CHECK (bucket_id = 'contact-attachments');
CREATE POLICY "Staff delete contact attachments" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'contact-attachments');
CREATE POLICY "Staff update service request attachments" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'service-request-uploads') WITH CHECK (bucket_id = 'service-request-uploads');
CREATE POLICY "Staff delete service request attachments" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'service-request-uploads');

-- 5) Revoke EXECUTE on internal SECURITY DEFINER helpers from anon/authenticated.
--    Public submission RPCs (submit_contact_message, submit_service_request, get_request_status)
--    must remain callable by anon for public forms — re-grant explicitly.
REVOKE EXECUTE ON FUNCTION public.generate_request_reference() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_contact_message_reference() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notif_pref_enabled(public.notification_type) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_contact_message() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_lead() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_review() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_message() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_log_status_change() FROM anon, authenticated, PUBLIC;

-- Keep public-facing RPCs callable
GRANT EXECUTE ON FUNCTION public.submit_contact_message(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_service_request(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_request_status(text) TO anon, authenticated;
