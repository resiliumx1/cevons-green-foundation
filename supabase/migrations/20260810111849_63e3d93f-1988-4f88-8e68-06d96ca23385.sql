REVOKE EXECUTE ON FUNCTION public.can_publish(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_publish(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;