
-- =========================================================
-- 1. Replace permissive authenticated policies with staff-only on CRM tables
-- =========================================================

-- activities
DROP POLICY IF EXISTS auth_select_activities ON public.activities;
DROP POLICY IF EXISTS auth_insert_activities ON public.activities;
DROP POLICY IF EXISTS auth_update_activities ON public.activities;
DROP POLICY IF EXISTS auth_delete_activities ON public.activities;
CREATE POLICY staff_select_activities ON public.activities FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_activities ON public.activities FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_activities ON public.activities FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_activities ON public.activities FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- campaigns
DROP POLICY IF EXISTS auth_select_campaigns ON public.campaigns;
DROP POLICY IF EXISTS auth_insert_campaigns ON public.campaigns;
DROP POLICY IF EXISTS auth_update_campaigns ON public.campaigns;
DROP POLICY IF EXISTS auth_delete_campaigns ON public.campaigns;
CREATE POLICY staff_select_campaigns ON public.campaigns FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_campaigns ON public.campaigns FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_campaigns ON public.campaigns FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_campaigns ON public.campaigns FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- crm_settings
DROP POLICY IF EXISTS auth_select_crm_settings ON public.crm_settings;
DROP POLICY IF EXISTS auth_insert_crm_settings ON public.crm_settings;
DROP POLICY IF EXISTS auth_update_crm_settings ON public.crm_settings;
DROP POLICY IF EXISTS auth_delete_crm_settings ON public.crm_settings;
CREATE POLICY staff_select_crm_settings ON public.crm_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_crm_settings ON public.crm_settings FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_crm_settings ON public.crm_settings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_crm_settings ON public.crm_settings FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- jobs
DROP POLICY IF EXISTS auth_select_jobs ON public.jobs;
DROP POLICY IF EXISTS auth_insert_jobs ON public.jobs;
DROP POLICY IF EXISTS auth_update_jobs ON public.jobs;
DROP POLICY IF EXISTS auth_delete_jobs ON public.jobs;
CREATE POLICY staff_select_jobs ON public.jobs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_jobs ON public.jobs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_jobs ON public.jobs FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_jobs ON public.jobs FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- media_items (keep public read of published; restrict full read + writes to staff)
DROP POLICY IF EXISTS "Authenticated can read all media" ON public.media_items;
DROP POLICY IF EXISTS "Authenticated can insert media" ON public.media_items;
DROP POLICY IF EXISTS "Authenticated can update media" ON public.media_items;
DROP POLICY IF EXISTS "Authenticated can delete media" ON public.media_items;
CREATE POLICY "Staff can read all media" ON public.media_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert media" ON public.media_items FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update media" ON public.media_items FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete media" ON public.media_items FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- notification_preferences
DROP POLICY IF EXISTS "Authenticated read prefs" ON public.notification_preferences;
DROP POLICY IF EXISTS "Authenticated insert prefs" ON public.notification_preferences;
DROP POLICY IF EXISTS "Authenticated update prefs" ON public.notification_preferences;
CREATE POLICY staff_read_prefs ON public.notification_preferences FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_prefs ON public.notification_preferences FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_prefs ON public.notification_preferences FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Authenticated read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated delete notifications" ON public.notifications;
CREATE POLICY staff_read_notifications ON public.notifications FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_update_notifications ON public.notifications FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_notifications ON public.notifications FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- quotes
DROP POLICY IF EXISTS auth_select_quotes ON public.quotes;
DROP POLICY IF EXISTS auth_insert_quotes ON public.quotes;
DROP POLICY IF EXISTS auth_update_quotes ON public.quotes;
DROP POLICY IF EXISTS auth_delete_quotes ON public.quotes;
CREATE POLICY staff_select_quotes ON public.quotes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_quotes ON public.quotes FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_quotes ON public.quotes FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_quotes ON public.quotes FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- request_status_events
DROP POLICY IF EXISTS auth_read_status_events ON public.request_status_events;
DROP POLICY IF EXISTS auth_insert_status_events ON public.request_status_events;
CREATE POLICY staff_read_status_events ON public.request_status_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_status_events ON public.request_status_events FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- reviews: keep public read of published (untouched); tighten writes to staff
DROP POLICY IF EXISTS auth_select_reviews ON public.reviews;
DROP POLICY IF EXISTS auth_insert_reviews ON public.reviews;
DROP POLICY IF EXISTS auth_update_reviews ON public.reviews;
DROP POLICY IF EXISTS auth_delete_reviews ON public.reviews;
CREATE POLICY staff_select_reviews ON public.reviews FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_reviews ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_reviews ON public.reviews FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_reviews ON public.reviews FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- utm_links
DROP POLICY IF EXISTS "Authenticated can view utm_links" ON public.utm_links;
DROP POLICY IF EXISTS "Authenticated can insert utm_links" ON public.utm_links;
DROP POLICY IF EXISTS "Authenticated can update utm_links" ON public.utm_links;
DROP POLICY IF EXISTS "Authenticated can delete utm_links" ON public.utm_links;
CREATE POLICY staff_select_utm_links ON public.utm_links FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY staff_insert_utm_links ON public.utm_links FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_update_utm_links ON public.utm_links FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY staff_delete_utm_links ON public.utm_links FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- =========================================================
-- 2. Storage: staff-only read/update/delete on private buckets
-- =========================================================

DROP POLICY IF EXISTS "Authenticated read contact attachments" ON storage.objects;
DROP POLICY IF EXISTS "Staff can read service request attachments" ON storage.objects;

CREATE POLICY "Staff read contact attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contact-attachments' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff read service request attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'service-request-uploads' AND public.is_staff(auth.uid()));

-- =========================================================
-- 3. Lock down SECURITY DEFINER function EXECUTE privileges
-- =========================================================

-- Revoke default PUBLIC EXECUTE on all sensitive functions
REVOKE EXECUTE ON FUNCTION public.generate_contact_message_reference() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_request_reference() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_request_status(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_contact_message(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_service_request(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notif_pref_enabled(notification_type) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.tg_audit_contact_messages() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_audit_service_requests() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_log_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_contact_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_lead() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_notify_new_review() FROM PUBLIC, anon, authenticated;

-- Role helpers must remain callable by signed-in users so RLS policies can invoke them
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- Server-only RPCs (edge functions call these with service_role, which bypasses grants)
-- No grants to anon/authenticated.
