CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner','admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner','admin','staff','editor','contributor')
  );
$$;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_insert_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_update_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_delete_roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "admins_insert_roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()) AND user_id <> auth.uid());

CREATE POLICY "admins_update_roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()) AND user_id <> auth.uid())
WITH CHECK (public.is_admin(auth.uid()) AND user_id <> auth.uid());

CREATE POLICY "admins_delete_roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()) AND user_id <> auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;