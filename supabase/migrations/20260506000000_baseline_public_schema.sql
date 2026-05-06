-- Baseline public schema captured from linked Supabase project
-- Project: mwpscytkzjtkqjjqytqu (Sir Leo Site)
-- Captured: 2026-05-06
--
-- This migration is a starting point for version-controlling future database
-- changes. It is written idempotently so it can document the existing remote
-- schema without needing to be applied back to the current remote project.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_net with schema extensions;

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  session_id text,
  event_type text,
  element text,
  page text,
  referrer text,
  user_agent text,
  ip text,
  city text,
  region text,
  country text,
  data jsonb
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  last_seen timestamptz default now(),
  phone text not null unique,
  name text,
  email text,
  source text,
  session_id text,
  status text default 'new',
  notes text,
  follow_up_date date,
  submission_count integer default 1,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  constraint contacts_status_check
    check (status = any (array['new', 'contacted', 'consultation', 'booked', 'declined', 'archived']::text[]))
);

create table if not exists public.events_calendar (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  event_date date,
  venue text,
  city text,
  capacity integer,
  ga_spots integer,
  vip_spots integer,
  status text default 'planning',
  description text,
  ticket_url text,
  constraint events_calendar_status_check
    check (status = any (array['planning', 'open', 'sold_out', 'past', 'cancelled']::text[]))
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  panel_type text,
  name text,
  phone text,
  email text,
  data jsonb,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  follow_up_sent boolean default false,
  sequence_step integer default 0
);

create table if not exists public.session_offers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid,
  contact_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  duration_value integer,
  duration_name text,
  base_price integer,
  addon_ids text[],
  addon_names text[],
  total_price integer,
  deposit_amount integer,
  notes text,
  private_notes text,
  status text default 'draft',
  source text default 'auto',
  created_at timestamptz default now(),
  updated_at timestamptz,
  sent_at timestamptz,
  viewed_at timestamptz,
  paid_at timestamptz,
  scheduled_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  pay_type text,
  amount_paid integer,
  stripe_session_id text,
  stripe_payment_intent text,
  view_count integer default 0,
  repeat_session boolean default false,
  completed boolean default false,
  rating integer,
  feedback text
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  event_id uuid references public.events_calendar(id),
  name text,
  phone text,
  email text,
  tier text default 'ga',
  status text default 'pending',
  session_id text,
  constraint waitlist_tier_check
    check (tier = any (array['ga', 'vip']::text[])),
  constraint waitlist_status_check
    check (status = any (array['pending', 'confirmed', 'declined', 'attended']::text[]))
);

alter table public.analytics enable row level security;
alter table public.contacts enable row level security;
alter table public.events_calendar enable row level security;
alter table public.session_offers enable row level security;
alter table public.submissions enable row level security;
alter table public.waitlist enable row level security;

create or replace function public.upsert_contact(
  p_phone text,
  p_name text,
  p_email text,
  p_source text,
  p_session_id text,
  p_utm_source text default null::text,
  p_utm_medium text default null::text,
  p_utm_campaign text default null::text
)
returns void
language plpgsql
security definer
as $function$
begin
  insert into public.contacts (
    phone, name, email, source, session_id, status, submission_count,
    utm_source, utm_medium, utm_campaign
  )
  values (
    p_phone, p_name, p_email, p_source, p_session_id, 'new', 1,
    p_utm_source, p_utm_medium, p_utm_campaign
  )
  on conflict (phone) do update set
    name = excluded.name,
    email = coalesce(excluded.email, contacts.email),
    last_seen = now(),
    submission_count = contacts.submission_count + 1,
    utm_source = coalesce(excluded.utm_source, contacts.utm_source),
    utm_medium = coalesce(excluded.utm_medium, contacts.utm_medium),
    utm_campaign = coalesce(excluded.utm_campaign, contacts.utm_campaign);
end;
$function$;

create or replace function public.notify_new_submission()
returns trigger
language plpgsql
as $function$
begin
  perform net.http_post(
    url := 'https://sirleo-site.netlify.app/.netlify/functions/notify',
    body := to_jsonb(new),
    headers := '{"Content-Type": "application/json"}'
  );
  return new;
end;
$function$;

drop trigger if exists on_submission_insert on public.submissions;
create trigger on_submission_insert
after insert on public.submissions
for each row execute function public.notify_new_submission();

do $$
begin
  create policy "anon can insert analytics"
    on public.analytics for insert to anon with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "public insert only"
    on public.analytics for insert to anon with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "anon insert contacts"
    on public.contacts for insert to anon with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "anon read events"
    on public.events_calendar for select to anon using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "Service role full access"
    on public.session_offers for all to public using (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "anon can insert submissions"
    on public.submissions for insert to anon with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "public insert only"
    on public.submissions for insert to anon with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "anon can insert waitlist"
    on public.waitlist for insert to anon with check (true);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "anon insert waitlist"
    on public.waitlist for insert to anon with check (true);
exception when duplicate_object then null;
end $$;
