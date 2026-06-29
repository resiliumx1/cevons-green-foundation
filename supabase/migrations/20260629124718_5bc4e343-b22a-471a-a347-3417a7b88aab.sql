
-- 1) Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','staff','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','staff')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

-- Seed existing auth users as admin so the CRM keeps working.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role FROM auth.users u
ON CONFLICT (user_id, role) DO NOTHING;

-- 2) Restrict SELECT/UPDATE/DELETE on sensitive tables to staff/admin.

-- contact_messages
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON public.contact_messages;
CREATE POLICY "Staff can read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- service_requests (drop both duplicate broad policies)
DROP POLICY IF EXISTS "Authenticated users can read service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Authenticated users can delete service requests" ON public.service_requests;
DROP POLICY IF EXISTS "auth_select_service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "auth_update_service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "auth_delete_service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "auth_insert_service_requests" ON public.service_requests;
CREATE POLICY "Staff can read service requests" ON public.service_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update service requests" ON public.service_requests
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete service requests" ON public.service_requests
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert service requests" ON public.service_requests
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- customers
DROP POLICY IF EXISTS "auth_select_customers" ON public.customers;
DROP POLICY IF EXISTS "auth_update_customers" ON public.customers;
DROP POLICY IF EXISTS "auth_delete_customers" ON public.customers;
DROP POLICY IF EXISTS "auth_insert_customers" ON public.customers;
CREATE POLICY "Staff can read customers" ON public.customers
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert customers" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update customers" ON public.customers
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete customers" ON public.customers
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- invoices
DROP POLICY IF EXISTS "auth_select_invoices" ON public.invoices;
DROP POLICY IF EXISTS "auth_update_invoices" ON public.invoices;
DROP POLICY IF EXISTS "auth_delete_invoices" ON public.invoices;
DROP POLICY IF EXISTS "auth_insert_invoices" ON public.invoices;
CREATE POLICY "Staff can read invoices" ON public.invoices
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert invoices" ON public.invoices
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update invoices" ON public.invoices
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete invoices" ON public.invoices
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- newsletter_subscribers
DROP POLICY IF EXISTS "Authenticated read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Staff can read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- 3) Storage path constraints
DROP POLICY IF EXISTS "Anyone can upload contact attachments" ON storage.objects;
CREATE POLICY "Anyone can upload contact attachments to public/"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'contact-attachments'
    AND name LIKE 'public/%'
    AND length(name) < 512
    AND octet_length(name) < 512
  );

DROP POLICY IF EXISTS "Anyone can upload service request attachments" ON storage.objects;
CREATE POLICY "Anyone can upload service request attachments to public/"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'service-request-uploads'
    AND name LIKE 'public/%'
    AND length(name) < 512
    AND octet_length(name) < 512
  );

-- 4) Revoke EXECUTE on SECURITY DEFINER RPCs from anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.submit_contact_message(jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_service_request(jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_request_status(text) FROM anon, authenticated, PUBLIC;
