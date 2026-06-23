create table if not exists public.circle_memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  circle_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active'
    constraint circle_memberships_status_check
    check (status in ('active', 'paused', 'ended')),
  joined_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint circle_memberships_unique_pair unique (user_id, circle_user_id),
  constraint circle_memberships_no_self_check check (user_id <> circle_user_id),
  constraint circle_memberships_ended_at_check check (
    (status = 'ended' and ended_at is not null)
    or (status <> 'ended' and ended_at is null)
  )
);
