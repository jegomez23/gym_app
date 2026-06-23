create index if not exists commits_user_id_recorded_at_idx
  on public.commits (user_id, recorded_at desc)
  where deleted_at is null;

create index if not exists commits_user_id_created_at_idx
  on public.commits (user_id, created_at desc)
  where deleted_at is null;

create index if not exists commits_visibility_recorded_at_idx
  on public.commits (visibility, recorded_at desc)
  where deleted_at is null;

create index if not exists reflections_commit_id_idx
  on public.reflections (commit_id)
  where deleted_at is null;

create index if not exists reflections_user_id_created_at_idx
  on public.reflections (user_id, created_at desc)
  where deleted_at is null;

create index if not exists circle_memberships_user_id_status_idx
  on public.circle_memberships (user_id, status)
  where deleted_at is null;

create index if not exists circle_memberships_circle_user_id_status_idx
  on public.circle_memberships (circle_user_id, status)
  where deleted_at is null;

create index if not exists supports_to_user_id_created_at_idx
  on public.supports (to_user_id, created_at desc)
  where deleted_at is null;

create index if not exists supports_from_user_id_created_at_idx
  on public.supports (from_user_id, created_at desc)
  where deleted_at is null;

create index if not exists supports_pair_created_at_idx
  on public.supports (from_user_id, to_user_id, created_at desc)
  where deleted_at is null;
