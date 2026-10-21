-- Run this in Supabase -> SQL Editor (safe to run more than once)

-- Every message this server sends through Bird
create table if not exists public.bird_messages (
  id text primary key,                  -- Bird message id, e.g. sms_... or em_...
  channel text not null check (channel in ('sms', 'email')),
  to_address text not null,
  from_address text,
  status text not null default 'accepted',
  last_event text,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every webhook event Bird sends us (webhook id = primary key, so duplicates are ignored)
create table if not exists public.bird_events (
  id text primary key,
  type text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- Only the server (service role key) touches these tables. No policies = no public access.
alter table public.bird_messages enable row level security;
alter table public.bird_events enable row level security;
