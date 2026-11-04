-- Rayana: Supabase setup.
-- 1) The app's current Supabase mode stores the whole store state as one JSON document (see lib/db.ts).
--    Run this once in the Supabase SQL editor. Only the service role key can read or write it.
create table if not exists public.rayana_state (
  id int primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.rayana_state enable row level security;
-- No policies on purpose: anon and authenticated roles get no access. The server uses SUPABASE_SERVICE_ROLE_KEY.

-- 2) Optional: a bucket for product and review images (the app currently stores uploads on local disk).
-- insert into storage.buckets (id, name, public) values ('rayana-uploads', 'rayana-uploads', true) on conflict do nothing;
