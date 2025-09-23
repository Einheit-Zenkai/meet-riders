-- Run this whole script in Supabase SQL Editor.
-- It is idempotent and safe to run multiple times.

-- 1) Ensure profiles has a points column for leaderboard
alter table if exists public.profiles
  add column if not exists points int default 0;

-- 2) Create user_relationships table for connections + blocks
create table if not exists public.user_relationships (
  id bigserial primary key,
  initiator_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('connected','blocked')),
  created_at timestamptz default now(),
  unique (initiator_id, receiver_id)
);

alter table public.user_relationships enable row level security;

-- 3) Basic RLS policies
-- Initiators can manage their own relationship rows
drop policy if exists "manage-own-relationships" on public.user_relationships;
create policy "manage-own-relationships" on public.user_relationships
  for all
  using (auth.uid() = initiator_id)
  with check (auth.uid() = initiator_id);

-- Allow receivers to read rows that involve them (to know if they are blocked)
drop policy if exists "receivers-can-read" on public.user_relationships;
create policy "receivers-can-read" on public.user_relationships
  for select
  using (auth.uid() = initiator_id or auth.uid() = receiver_id);

-- 4) Helpful indexes
create index if not exists idx_user_relationships_initiator on public.user_relationships(initiator_id);
create index if not exists idx_user_relationships_receiver on public.user_relationships(receiver_id);
create index if not exists idx_user_relationships_status on public.user_relationships(status);

-- 5) Sanity checks (optional)
-- select to_regclass('public.user_relationships') as user_relationships,
--        (select count(*) from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='points') as profiles_points;
