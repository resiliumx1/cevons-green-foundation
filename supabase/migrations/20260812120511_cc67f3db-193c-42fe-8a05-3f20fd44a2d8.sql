create or replace function public.tg_site_images_guard_del()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if auth.uid() is null and current_user in ('postgres', 'supabase_admin', 'service_role') then
    return old;
  end if;
  if not public.can_publish(auth.uid()) then
    raise exception 'Your role cannot change images on the public site';
  end if;
  return old;
end;
$function$;

revoke all on function public.tg_site_images_guard_del() from public, anon, authenticated;

DELETE FROM public.site_images WHERE slot = '__diag_tmp';