create or replace view public.active_circle_memberships
with (security_invoker = true)
as
select
  id,
  user_id,
  circle_user_id,
  joined_at,
  created_at
from public.circle_memberships
where status = 'active'
  and deleted_at is null;

create or replace view public.visible_commits
with (security_invoker = true)
as
select
  c.id,
  c.user_id,
  p.name as profile_name,
  p.avatar_url as profile_avatar_url,
  c.title,
  c.type,
  c.recorded_at,
  c.duration_minutes,
  c.intensity,
  c.note,
  c.visibility,
  c.evidence,
  c.created_at
from public.commits c
join public.profiles p on p.id = c.user_id
where c.deleted_at is null
  and p.deleted_at is null;

create or replace view public.commit_reflection_counts
with (security_invoker = true)
as
select
  c.id as commit_id,
  count(r.id)::bigint as reflection_count
from public.commits c
left join public.reflections r
  on r.commit_id = c.id
 and r.deleted_at is null
where c.deleted_at is null
group by c.id;

create or replace view public.support_history
with (security_invoker = true)
as
select
  s.id,
  s.from_user_id,
  from_profile.name as from_name,
  from_profile.avatar_url as from_avatar_url,
  s.to_user_id,
  to_profile.name as to_name,
  to_profile.avatar_url as to_avatar_url,
  s.message,
  s.created_at
from public.supports s
join public.profiles from_profile on from_profile.id = s.from_user_id
join public.profiles to_profile on to_profile.id = s.to_user_id
where s.deleted_at is null
  and from_profile.deleted_at is null
  and to_profile.deleted_at is null;

grant select on public.active_circle_memberships to authenticated;
grant select on public.visible_commits to authenticated;
grant select on public.commit_reflection_counts to authenticated;
grant select on public.support_history to authenticated;
