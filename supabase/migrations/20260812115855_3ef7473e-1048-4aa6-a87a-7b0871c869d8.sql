create or replace function public.tg_site_images_guard()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  -- Trusted server-side maintenance (migrations / service_role) has no auth.uid().
  if auth.uid() is null and current_user in ('postgres', 'supabase_admin', 'service_role') then
    new.updated_at := now();
    if tg_op = 'UPDATE' then
      new.slot := old.slot;
      new.updated_by := coalesce(new.updated_by, old.updated_by);
    end if;
    return new;
  end if;

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

UPDATE public.site_images SET
  image_path = draft_image_path, image_w = draft_image_w, image_h = draft_image_h,
  alt = 'Orange CEVONS Sinotruk HOWO vacuum tanker truck parked on a sand road beside a wooden fence, signwritten for portable toilet rental and septic tank emptying.',
  draft_image_path = NULL, draft_image_w = NULL, draft_image_h = NULL, draft_alt = NULL
WHERE slot = 'svc_septic_fleet_1' AND draft_image_path IS NOT NULL;

UPDATE public.site_images SET
  image_path = draft_image_path, image_w = draft_image_w, image_h = draft_image_h,
  alt = 'Two CEVONS crew members in orange hard hats, high-visibility vests and red gloves standing at the rear of an orange vacuum tanker with suction hoses coiled across the tank.',
  draft_image_path = NULL, draft_image_w = NULL, draft_image_h = NULL, draft_alt = NULL
WHERE slot = 'svc_septic_fleet_2' AND draft_image_path IS NOT NULL;

UPDATE public.site_images SET
  image_path = draft_image_path, image_w = draft_image_w, image_h = draft_image_h,
  alt = 'A CEVONS worker in an orange hard hat and high-visibility vest guiding a suction hose into an open concrete septic chamber on a cleared site.',
  draft_image_path = NULL, draft_image_w = NULL, draft_image_h = NULL, draft_alt = NULL
WHERE slot = 'svc_septic_fleet_3' AND draft_image_path IS NOT NULL;

UPDATE public.site_images SET
  image_path = draft_image_path, image_w = draft_image_w, image_h = draft_image_h,
  alt = 'Orange CEVONS Sinotruk HOWO roll-off truck carrying a red skip bin on a Georgetown street.',
  draft_image_path = NULL, draft_image_w = NULL, draft_image_h = NULL, draft_alt = NULL
WHERE slot = 'svc_skip_bin_hero' AND draft_image_path IS NOT NULL;

UPDATE public.site_images SET
  image_path = draft_image_path, image_w = draft_image_w, image_h = draft_image_h,
  alt = 'Illustration of an orange CEVONS 52 cubic yard roll-off container filled with rubble and bagged waste, labelled 22 feet long, 8 feet wide and 8 feet high.',
  draft_image_path = NULL, draft_image_w = NULL, draft_image_h = NULL, draft_alt = NULL
WHERE slot = 'svc_skip_bin_size_52' AND draft_image_path IS NOT NULL;