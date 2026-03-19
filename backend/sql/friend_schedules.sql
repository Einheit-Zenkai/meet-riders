-- Friend scheduling requests between mutuals or users with matching ideal stop/time.

create extension if not exists pgcrypto;

create table if not exists public.friend_schedules (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  candidate_source text not null default 'mutual',
  proposed_day_of_week smallint not null check (proposed_day_of_week between 0 and 6),
  proposed_time time not null,
  location_note text null,
  request_message text null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  response_note text null,
  accepted_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (requester_id <> invitee_id)
);

create index if not exists idx_friend_schedules_requester on public.friend_schedules(requester_id);
create index if not exists idx_friend_schedules_invitee on public.friend_schedules(invitee_id);
create index if not exists idx_friend_schedules_status on public.friend_schedules(status);
create index if not exists idx_friend_schedules_created_at on public.friend_schedules(created_at desc);

alter table public.friend_schedules enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'friend_schedules' and policyname = 'friend_schedules_select_self'
  ) then
    create policy friend_schedules_select_self
      on public.friend_schedules
      for select
      using (auth.uid() = requester_id or auth.uid() = invitee_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'friend_schedules' and policyname = 'friend_schedules_insert_requester'
  ) then
    create policy friend_schedules_insert_requester
      on public.friend_schedules
      for insert
      with check (auth.uid() = requester_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'friend_schedules' and policyname = 'friend_schedules_update_participants'
  ) then
    create policy friend_schedules_update_participants
      on public.friend_schedules
      for update
      using (auth.uid() = requester_id or auth.uid() = invitee_id)
      with check (auth.uid() = requester_id or auth.uid() = invitee_id);
  end if;
end
$$;

create or replace function public.set_friend_schedules_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_friend_schedules_updated_at on public.friend_schedules;
create trigger trg_friend_schedules_updated_at
before update on public.friend_schedules
for each row
execute function public.set_friend_schedules_updated_at();

grant select, insert, update on public.friend_schedules to authenticated;
