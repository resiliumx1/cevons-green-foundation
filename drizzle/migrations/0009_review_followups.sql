create table if not exists public.review_followups (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null unique references public.service_requests(id) on delete cascade,
  reference text,
  recipient_email text,
  recipient_name text,
  service text,
  status text not null default 'pending' check (status in ('pending','sent','skipped','failed','cancelled')),
  due_at timestamptz not null default now(),
  sent_at timestamptz,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.review_followups to authenticated;
grant all on public.review_followups to service_role;

alter table public.review_followups enable row level security;

drop policy if exists "Staff read review followups" on public.review_followups;
create policy "Staff read review followups"
  on public.review_followups for select to authenticated
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff manage review followups" on public.review_followups;
create policy "Staff manage review followups"
  on public.review_followups for update to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create index if not exists review_followups_due_idx
  on public.review_followups (status, due_at);

create or replace function public.queue_review_followup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  delay_hours numeric := 24;
  cfg jsonb;
begin
  if new.status = 'won' and coalesce(old.status, '') <> 'won' then
    select value into cfg from public.crm_settings where key = 'review_followup';
    if cfg ? 'delayHours' then
      delay_hours := greatest(0, least(720, coalesce((cfg->>'delayHours')::numeric, 24)));
    end if;

    insert into public.review_followups (
      service_request_id, reference, recipient_email, recipient_name, service, due_at
    )
    values (
      new.id, new.reference, new.email, new.name, new.service,
      now() + make_interval(mins => (delay_hours * 60)::int)
    )
    on conflict (service_request_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists service_requests_review_followup on public.service_requests;
create trigger service_requests_review_followup
  after update of status on public.service_requests
  for each row execute function public.queue_review_followup();

insert into public.crm_settings (key, value)
values ('review_followup', '{"enabled": false, "reviewUrl": "", "delayHours": 24}'::jsonb)
on conflict (key) do nothing;