alter table public.site_images alter column image_path drop not null;
alter table public.site_images alter column alt drop not null;
alter table public.site_images alter column alt set default '';

create or replace function public.tg_site_images_guard()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if tg_op = 'UPDATE' then
    if (new.image_path is distinct from old.image_path)
       or (new.image_w is distinct from old.image_w)
       or (new.image_h is distinct from old.image_h)
       or (new.alt is distinct from old.alt) then
      if not public.can_publish(auth.uid()) then
        raise exception 'Your role can save drafts but cannot publish';
      end if;
    end if;
    new.slot := old.slot;
  else
    -- A brand new row may only carry a DRAFT unless the caller can publish.
    if (new.image_path is not null or coalesce(new.alt, '') <> '')
       and not public.can_publish(auth.uid()) then
      raise exception 'Your role can save drafts but cannot publish';
    end if;
  end if;

  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$function$;

revoke all on function public.tg_site_images_guard() from public, anon, authenticated;