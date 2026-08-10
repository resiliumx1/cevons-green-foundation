-- ============================================================
-- People & invitations for CEVONS Website Admin
-- ============================================================

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz
);

CREATE UNIQUE INDEX invitations_pending_email_idx
  ON public.invitations (lower(email))
  WHERE accepted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invitations"
  ON public.invitations FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create invitations"
  ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update invitations"
  ON public.invitations FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete invitations"
  ON public.invitations FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- People listing: exposes ONLY id / email / role / timestamps.
-- auth.users is never readable by the client directly.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_admin_people()
RETURNS TABLE (
  user_id uuid,
  email text,
  role public.app_role,
  role_granted_at timestamptz,
  user_created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.user_id,
         u.email::text,
         ur.role,
         ur.created_at,
         u.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE public.is_admin(auth.uid())
  ORDER BY ur.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.list_admin_people() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_admin_people() TO authenticated;

-- ------------------------------------------------------------
-- Role administration. Callers must be owner/admin and may never
-- alter their own role rows.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only an owner or admin can change roles';
  END IF;
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_remove_user_access(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only an owner or admin can remove access';
  END IF;
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot remove your own access';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_remove_user_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_remove_user_access(uuid) TO authenticated;

-- ------------------------------------------------------------
-- Invitation acceptance. The role comes from the invitation row,
-- never from the caller, so a user cannot pick their own role.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_invitation()
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _inv public.invitations%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT u.email::text INTO _email FROM auth.users u WHERE u.id = _uid;
  IF _email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO _inv
  FROM public.invitations
  WHERE lower(email) = lower(_email)
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _inv.role)
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.invitations SET accepted_at = now() WHERE id = _inv.id;

  RETURN _inv.role;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_invitation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_invitation() TO authenticated;