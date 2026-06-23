create or replace function public.enforce_commit_immutability()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.title is distinct from old.title
    or new.type is distinct from old.type
    or new.recorded_at is distinct from old.recorded_at
    or new.duration_minutes is distinct from old.duration_minutes
    or new.intensity is distinct from old.intensity
    or new.note is distinct from old.note
    or new.evidence is distinct from old.evidence
    or new.created_at is distinct from old.created_at then
    raise exception 'commit content is immutable';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_reflection_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.commit_id is distinct from old.commit_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'reflection ownership and commit link are immutable';
  end if;

  if tg_op = 'INSERT' and not exists (
    select 1
    from public.commits c
    where c.id = new.commit_id
      and c.user_id = new.user_id
      and c.deleted_at is null
  ) then
    raise exception 'reflection must belong to the same owner as its commit';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_circle_membership_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.circle_user_id is distinct from old.circle_user_id
    or new.joined_at is distinct from old.joined_at
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'circle membership participants and start date are immutable';
  end if;

  if new.status = 'ended' and new.ended_at is null then
    new.ended_at = now();
  elsif new.status <> 'ended' then
    new.ended_at = null;
  end if;

  return new;
end;
$$;

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
    joined_at,
    ended_at,
    created_at,
    deleted_at
  )
  values (
    new.circle_user_id,
    new.user_id,
    new.status,
    new.joined_at,
    new.ended_at,
    new.created_at,
    new.deleted_at
  )
  on conflict (user_id, circle_user_id) do update
  set status = excluded.status,
      ended_at = excluded.ended_at,
      deleted_at = excluded.deleted_at;

  return new;
end;
$$;

create or replace function public.enforce_support_integrity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.from_user_id is distinct from old.from_user_id
    or new.to_user_id is distinct from old.to_user_id
    or new.message is distinct from old.message
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'support content is immutable';
  end if;

  if tg_op = 'INSERT' and not exists (
    select 1
    from public.circle_memberships cm
    where cm.user_id = new.from_user_id
      and cm.circle_user_id = new.to_user_id
      and cm.status = 'active'
      and cm.deleted_at is null
  ) then
    raise exception 'support requires an active Circle relationship';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists enforce_commit_immutability on public.commits;
create trigger enforce_commit_immutability
  before update on public.commits
  for each row execute function public.enforce_commit_immutability();

drop trigger if exists enforce_reflection_integrity on public.reflections;
create trigger enforce_reflection_integrity
  before insert or update on public.reflections
  for each row execute function public.enforce_reflection_integrity();

drop trigger if exists update_reflections_updated_at on public.reflections;
create trigger update_reflections_updated_at
  before update on public.reflections
  for each row execute function public.update_updated_at_column();

drop trigger if exists enforce_circle_membership_integrity on public.circle_memberships;
create trigger enforce_circle_membership_integrity
  before insert or update on public.circle_memberships
  for each row execute function public.enforce_circle_membership_integrity();

drop trigger if exists sync_circle_membership_reciprocity on public.circle_memberships;
create trigger sync_circle_membership_reciprocity
  after insert or update of status, ended_at, deleted_at on public.circle_memberships
  for each row execute function public.sync_circle_membership_reciprocity();

drop trigger if exists enforce_support_integrity on public.supports;
create trigger enforce_support_integrity
  before insert or update on public.supports
  for each row execute function public.enforce_support_integrity();
