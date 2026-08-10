CREATE OR REPLACE FUNCTION public.can_publish(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner','admin','editor')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.can_publish(uuid) FROM anon;

DROP POLICY IF EXISTS "Staff can insert media posts" ON public.media_posts;
CREATE POLICY "Staff can insert media posts"
ON public.media_posts FOR INSERT TO authenticated
WITH CHECK (is_staff(auth.uid()) AND (published = false OR public.can_publish(auth.uid())));

DROP POLICY IF EXISTS "Staff can update media posts" ON public.media_posts;
CREATE POLICY "Staff can update media posts"
ON public.media_posts FOR UPDATE TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()) AND (published = false OR public.can_publish(auth.uid())));