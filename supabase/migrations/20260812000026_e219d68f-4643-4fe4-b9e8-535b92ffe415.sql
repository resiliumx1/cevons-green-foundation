alter table public.site_images
  add column if not exists draft_image_path text,
  add column if not exists draft_image_w integer,
  add column if not exists draft_image_h integer,
  add column if not exists draft_alt text;

-- Visitors may read the LIVE columns only; the draft columns are staff-only.
revoke select on public.site_images from anon;
grant select (slot, image_path, image_w, image_h, alt, updated_at) on public.site_images to anon;
grant select, insert, update, delete on public.site_images to authenticated;
grant all on public.site_images to service_role;

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
    if not public.can_publish(auth.uid()) then
      raise exception 'Your role can save drafts but cannot publish';
    end if;
  end if;

  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$function$;

drop trigger if exists tg_site_images_guard on public.site_images;
create trigger tg_site_images_guard
  before insert or update on public.site_images
  for each row execute function public.tg_site_images_guard();