-- Run this in Supabase dashboard → SQL editor

create table if not exists session_offers (
  id                  uuid default gen_random_uuid() primary key,
  -- Links
  submission_id       uuid,
  contact_id          uuid,
  -- Client snapshot
  client_name         text,
  client_email        text,
  client_phone        text,
  -- Session details
  duration_value      integer,
  duration_name       text,
  base_price          integer,
  addon_ids           text[],
  addon_names         text[],
  total_price         integer,
  deposit_amount      integer,
  notes               text,
  private_notes       text,
  -- Lifecycle
  status              text default 'draft',   -- draft | sent | viewed | paid | completed | cancelled
  source              text default 'auto',     -- auto (inquiry) | manual (admin)
  -- Timestamps
  created_at          timestamptz default now(),
  updated_at          timestamptz,
  sent_at             timestamptz,
  viewed_at           timestamptz,
  paid_at             timestamptz,
  scheduled_at        timestamptz,
  completed_at        timestamptz,
  cancelled_at        timestamptz,
  -- Payment
  pay_type            text,
  amount_paid         integer,
  stripe_session_id   text,
  stripe_payment_intent text,
  -- Tracking
  view_count          integer default 0,
  repeat_session      boolean default false,
  -- Post-session
  completed           boolean default false,
  rating              integer,
  feedback            text
);

alter table session_offers enable row level security;
create policy "Service role full access" on session_offers for all using (true);
