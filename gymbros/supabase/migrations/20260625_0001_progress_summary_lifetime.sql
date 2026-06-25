-- get_progress_summary feeds deriveState and isFirstCommit as a *lifetime* identity
-- signal (total_commits, last_commit_at), but its default window was the last 30 days.
-- A user returning after a gap > 30 days therefore read as total_commits = 0 /
-- last_commit_at = null and derived "beginning" ("empieza a dejar evidencia") instead
-- of "returning" ("la base sigue ahí") — breaking the Quiet Return, the product's
-- emotional anchor, for exactly the people it exists for.
--
-- Fix: default to all-time. The optional range params are kept (same signature, so the
-- generated types and RPC wrapper are unchanged) for any future scoped caller.
create or replace function public.get_progress_summary(
  p_profile_id uuid default auth.uid(),
  p_from timestamptz default '-infinity',
  p_to timestamptz default 'infinity'
)
returns table (
  profile_id uuid,
  total_commits bigint,
  active_days bigint,
  first_commit_at timestamptz,
  last_commit_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p_profile_id as profile_id,
    count(c.id)::bigint as total_commits,
    count(distinct c.recorded_at::date)::bigint as active_days,
    min(c.recorded_at) as first_commit_at,
    max(c.recorded_at) as last_commit_at
  from public.commits c
  where c.user_id = p_profile_id
    and c.deleted_at is null
    and c.recorded_at >= p_from
    and c.recorded_at <= p_to;
$$;
