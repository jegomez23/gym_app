alter table public.circle_memberships
  add column if not exists invited_by uuid references public.profiles(id) on delete set null;

alter table public.circle_memberships
  drop constraint if exists circle_memberships_status_check,
  add constraint circle_memberships_status_check
    check (status in ('pending', 'active', 'paused', 'ended'));

drop policy if exists profiles_select_discoverable on public.profiles;
create policy profiles_select_discoverable on public.profiles
  for select
  to authenticated
  using (deleted_at is null and onboarding_completed = true);

create or replace function public.sync_circle_membership_reciprocity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  insert into public.circle_memberships (
    user_id,
    circle_user_id,
    status,
    invited_by,
    joined_at,
    ended_at,
    created_at,
    deleted_at
  )
  values (
    new.circle_user_id,
    new.user_id,
    new.status,
    new.invited_by,
    new.joined_at,
    new.ended_at,
    new.created_at,
    new.deleted_at
  )
  on conflict (user_id, circle_user_id) do update
  set status = excluded.status,
      invited_by = excluded.invited_by,
      ended_at = excluded.ended_at,
      deleted_at = excluded.deleted_at;

  return new;
end;
$$;

create table if not exists public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  type text not null
    constraint notifications_type_check
    check (type in ('support_received', 'circle_invitation', 'invitation_accepted', 'reflection_received')),
  entity_type text
    constraint notifications_entity_type_check
    check (entity_type is null or entity_type in ('support', 'circle_membership', 'reflection', 'commit')),
  entity_id uuid,
  message text not null
    constraint notifications_message_length_check
    check (char_length(btrim(message)) between 1 and 240),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint notifications_no_self_actor_check
    check (actor_user_id is null or actor_user_id <> recipient_user_id)
);

create index if not exists notifications_recipient_created_at_idx
  on public.notifications (recipient_user_id, created_at desc)
  where deleted_at is null;

create index if not exists notifications_recipient_read_at_idx
  on public.notifications (recipient_user_id, read_at)
  where deleted_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_select_recipient on public.notifications;
create policy notifications_select_recipient on public.notifications
  for select
  to authenticated
  using (recipient_user_id = auth.uid() and deleted_at is null);

drop policy if exists notifications_insert_actor on public.notifications;
create policy notifications_insert_actor on public.notifications
  for insert
  to authenticated
  with check (actor_user_id = auth.uid());

drop policy if exists notifications_update_recipient on public.notifications;
create policy notifications_update_recipient on public.notifications
  for update
  to authenticated
  using (recipient_user_id = auth.uid() and deleted_at is null)
  with check (recipient_user_id = auth.uid());

grant select, insert, update on public.notifications to authenticated;
