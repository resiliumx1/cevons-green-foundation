-- 1. WhatsApp channel on review follow-ups -------------------------------
alter table public.review_followups
  add column if not exists recipient_phone text,
  add column if not exists manychat_subscriber_id text,
  add column if not exists whatsapp_status text not null default 'pending',
  add column if not exists whatsapp_sent_at timestamptz,
  add column if not exists whatsapp_error text,
  add column if not exists whatsapp_attempts integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.review_followups'::regclass
      and conname = 'review_followups_whatsapp_status_chk'
  ) then
    alter table public.review_followups
      add constraint review_followups_whatsapp_status_chk
      check (whatsapp_status in ('pending','sent','skipped','failed'));
  end if;
end $$;

-- 2. ManyChat identity on service requests --------------------------------
alter table public.service_requests
  add column if not exists manychat_subscriber_id text,
  add column if not exists source_channel text;

create index if not exists service_requests_manychat_subscriber_idx
  on public.service_requests (manychat_subscriber_id);

-- 3. Verified ManyChat webhook inbox --------------------------------------
create table if not exists public.manychat_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id text not null unique,
  event text not null,
  subscriber_id text,
  phone text,
  payload jsonb not null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  attempts integer not null default 0
);

grant select on public.manychat_events to authenticated;
grant all on public.manychat_events to service_role;
alter table public.manychat_events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='manychat_events' and policyname='Staff can read ManyChat events') then
    create policy "Staff can read ManyChat events"
      on public.manychat_events for select to authenticated
      using (public.is_staff(auth.uid()));
  end if;
end $$;

-- 4. WhatsApp conversation log --------------------------------------------
create table if not exists public.manychat_messages (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid references public.service_requests(id) on delete cascade,
  subscriber_id text,
  phone text,
  direction text not null check (direction in ('inbound','outbound')),
  body text,
  kind text,
  status text not null default 'logged',
  error text,
  external_id text,
  created_at timestamptz not null default now()
);

create index if not exists manychat_messages_request_idx
  on public.manychat_messages (service_request_id, created_at desc);

grant select on public.manychat_messages to authenticated;
grant all on public.manychat_messages to service_role;
alter table public.manychat_messages enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='manychat_messages' and policyname='Staff can read WhatsApp messages') then
    create policy "Staff can read WhatsApp messages"
      on public.manychat_messages for select to authenticated
      using (public.is_staff(auth.uid()));
  end if;
end $$;

-- 5. Carry the customer phone onto queued follow-ups ----------------------
create or replace function public.queue_review_followup()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
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
      service_request_id, reference, recipient_email, recipient_name, service,
      recipient_phone, manychat_subscriber_id, due_at
    )
    values (
      new.id, new.reference, new.email, new.name, new.service,
      new.phone, new.manychat_subscriber_id,
      now() + make_interval(mins => (delay_hours * 60)::int)
    )
    on conflict (service_request_id) do nothing;
  end if;
  return new;
end;
$function$;