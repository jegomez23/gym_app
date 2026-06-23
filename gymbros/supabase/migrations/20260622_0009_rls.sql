alter table public.profiles enable row level security;
alter table public.commits enable row level security;
alter table public.reflections enable row level security;
alter table public.circle_memberships enable row level security;
alter table public.supports enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists profiles_select_circle on public.profiles;
create policy profiles_select_circle on public.profiles
  for select
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.circle_memberships cm
      where cm.user_id = auth.uid()
        and cm.circle_user_id = profiles.id
        and cm.status = 'active'
        and cm.deleted_at is null
    )
  );

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists commits_select_own on public.commits;
create policy commits_select_own on public.commits
  for select
  to authenticated
  using (user_id = auth.uid() and deleted_at is null);

drop policy if exists commits_select_circle on public.commits;
create policy commits_select_circle on public.commits
  for select
  to authenticated
  using (
    visibility = 'circle'
    and deleted_at is null
    and exists (
      select 1
      from public.circle_memberships cm
      where cm.user_id = commits.user_id
        and cm.circle_user_id = auth.uid()
        and cm.status = 'active'
        and cm.deleted_at is null
    )
  );

drop policy if exists commits_select_public_authenticated on public.commits;
create policy commits_select_public_authenticated on public.commits
  for select
  to authenticated
  using (visibility = 'public' and deleted_at is null);

drop policy if exists commits_insert_own on public.commits;
create policy commits_insert_own on public.commits
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists commits_update_operational_own on public.commits;
create policy commits_update_operational_own on public.commits
  for update
  to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

drop policy if exists reflections_select_own on public.reflections;
create policy reflections_select_own on public.reflections
  for select
  to authenticated
  using (user_id = auth.uid() and deleted_at is null);

drop policy if exists reflections_select_circle on public.reflections;
create policy reflections_select_circle on public.reflections
  for select
  to authenticated
  using (
    visibility = 'circle'
    and deleted_at is null
    and exists (
      select 1
      from public.commits c
      join public.circle_memberships cm
        on cm.user_id = c.user_id
       and cm.circle_user_id = auth.uid()
       and cm.status = 'active'
       and cm.deleted_at is null
      where c.id = reflections.commit_id
        and c.user_id = reflections.user_id
        and c.visibility = 'circle'
        and c.deleted_at is null
    )
  );

drop policy if exists reflections_insert_own on public.reflections;
create policy reflections_insert_own on public.reflections
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists reflections_update_own on public.reflections;
create policy reflections_update_own on public.reflections
  for update
  to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

drop policy if exists circle_memberships_select_participant on public.circle_memberships;
create policy circle_memberships_select_participant on public.circle_memberships
  for select
  to authenticated
  using (
    deleted_at is null
    and (user_id = auth.uid() or circle_user_id = auth.uid())
  );

drop policy if exists circle_memberships_insert_participant on public.circle_memberships;
create policy circle_memberships_insert_participant on public.circle_memberships
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists circle_memberships_update_participant on public.circle_memberships;
create policy circle_memberships_update_participant on public.circle_memberships
  for update
  to authenticated
  using (
    deleted_at is null
    and (user_id = auth.uid() or circle_user_id = auth.uid())
  )
  with check (user_id = auth.uid() or circle_user_id = auth.uid());

drop policy if exists supports_select_participant on public.supports;
create policy supports_select_participant on public.supports
  for select
  to authenticated
  using (
    deleted_at is null
    and (from_user_id = auth.uid() or to_user_id = auth.uid())
  );

drop policy if exists supports_insert_sender on public.supports;
create policy supports_insert_sender on public.supports
  for insert
  to authenticated
  with check (from_user_id = auth.uid());

drop policy if exists supports_update_sender_soft_delete on public.supports;
create policy supports_update_sender_soft_delete on public.supports
  for update
  to authenticated
  using (from_user_id = auth.uid() and deleted_at is null)
  with check (from_user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.commits to authenticated;
grant select, insert, update on public.reflections to authenticated;
grant select, insert, update on public.circle_memberships to authenticated;
grant select, insert, update on public.supports to authenticated;
