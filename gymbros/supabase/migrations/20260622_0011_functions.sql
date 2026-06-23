create or replace function public.get_circle_presence(
  p_profile_id uuid default auth.uid(),
  p_since timestamptz default now() - interval '24 hours'
)
returns table (
  member_id uuid,
  member_name text,
  member_avatar_url text,
  last_commit_id uuid,
  last_commit_title text,
  last_commit_recorded_at timestamptz,
  active_commit_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.id as member_id,
    p.name as member_name,
    p.avatar_url as member_avatar_url,
    last_commit.id as last_commit_id,
    last_commit.title as last_commit_title,
    last_commit.recorded_at as last_commit_recorded_at,
    count(recent_commit.id)::bigint as active_commit_count
  from public.active_circle_memberships cm
  join public.profiles p
    on p.id = cm.circle_user_id
   and p.deleted_at is null
  left join lateral (
    select c.id, c.title, c.recorded_at
    from public.commits c
    where c.user_id = cm.circle_user_id
      and c.deleted_at is null
      and c.visibility in ('circle', 'public')
    order by c.recorded_at desc
    limit 1
  ) last_commit on true
  left join public.commits recent_commit
    on recent_commit.user_id = cm.circle_user_id
   and recent_commit.deleted_at is null
   and recent_commit.visibility in ('circle', 'public')
   and recent_commit.recorded_at >= p_since
  where p_profile_id = auth.uid()
    and cm.user_id = p_profile_id
  group by
    p.id,
    p.name,
    p.avatar_url,
    last_commit.id,
    last_commit.title,
    last_commit.recorded_at
  order by last_commit.recorded_at desc nulls last, p.name asc;
$$;

create or replace function public.get_journey_timeline(
  p_profile_id uuid default auth.uid(),
  p_limit integer default 30,
  p_before timestamptz default null
)
returns table (
  commit_id uuid,
  user_id uuid,
  title text,
  type text,
  recorded_at timestamptz,
  duration_minutes integer,
  intensity text,
  note text,
  visibility text,
  evidence jsonb,
  reflections jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id as commit_id,
    c.user_id,
    c.title,
    c.type,
    c.recorded_at,
    c.duration_minutes,
    c.intensity,
    c.note,
    c.visibility,
    c.evidence,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'content', r.content,
          'type', r.type,
          'visibility', r.visibility,
          'created_at', r.created_at,
          'updated_at', r.updated_at
        )
        order by r.created_at asc
      ) filter (where r.id is not null),
      '[]'::jsonb
    ) as reflections
  from public.commits c
  left join public.reflections r
    on r.commit_id = c.id
   and r.deleted_at is null
  where c.user_id = p_profile_id
    and c.deleted_at is null
    and (p_before is null or c.recorded_at < p_before)
  group by c.id
  order by c.recorded_at desc
  limit least(greatest(p_limit, 1), 100);
$$;

create or replace function public.get_shared_history(
  p_other_profile_id uuid,
  p_limit integer default 20
)
returns table (
  other_profile_id uuid,
  joined_at timestamptz,
  days_connected integer,
  shared_commit_count bigint,
  supports_sent bigint,
  supports_received bigint,
  recent_commits jsonb,
  recent_supports jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  with membership as (
    select cm.circle_user_id, cm.joined_at
    from public.circle_memberships cm
    where cm.user_id = auth.uid()
      and cm.circle_user_id = p_other_profile_id
      and cm.deleted_at is null
    order by cm.joined_at asc
    limit 1
  ),
  limited_commits as (
    select c.id, c.title, c.type, c.recorded_at, c.intensity, c.visibility
    from membership m
    join public.commits c on c.user_id = m.circle_user_id
    where c.deleted_at is null
      and c.recorded_at >= m.joined_at
      and c.visibility in ('circle', 'public')
    order by c.recorded_at desc
    limit least(greatest(p_limit, 1), 100)
  ),
  limited_supports as (
    select s.id, s.from_user_id, s.to_user_id, s.message, s.created_at
    from public.supports s
    where (
      s.from_user_id = auth.uid()
      and s.to_user_id = p_other_profile_id
    ) or (
      s.from_user_id = p_other_profile_id
      and s.to_user_id = auth.uid()
    )
    order by s.created_at desc
    limit least(greatest(p_limit, 1), 100)
  )
  select
    m.circle_user_id as other_profile_id,
    m.joined_at,
    extract(day from now() - m.joined_at)::integer as days_connected,
    (
      select count(*)::bigint
      from public.commits c
      where c.user_id = m.circle_user_id
        and c.deleted_at is null
        and c.recorded_at >= m.joined_at
        and c.visibility in ('circle', 'public')
    ) as shared_commit_count,
    (
      select count(*)::bigint
      from public.supports s
      where s.from_user_id = auth.uid()
        and s.to_user_id = m.circle_user_id
        and s.deleted_at is null
    ) as supports_sent,
    (
      select count(*)::bigint
      from public.supports s
      where s.from_user_id = m.circle_user_id
        and s.to_user_id = auth.uid()
        and s.deleted_at is null
    ) as supports_received,
    coalesce((select jsonb_agg(to_jsonb(lc)) from limited_commits lc), '[]'::jsonb) as recent_commits,
    coalesce((select jsonb_agg(to_jsonb(ls)) from limited_supports ls), '[]'::jsonb) as recent_supports
  from membership m;
$$;

create or replace function public.get_progress_summary(
  p_profile_id uuid default auth.uid(),
  p_from timestamptz default now() - interval '30 days',
  p_to timestamptz default now()
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

create or replace function public.get_commit_detail(p_commit_id uuid)
returns table (
  commit_id uuid,
  user_id uuid,
  profile jsonb,
  title text,
  type text,
  recorded_at timestamptz,
  duration_minutes integer,
  intensity text,
  note text,
  visibility text,
  evidence jsonb,
  created_at timestamptz,
  reflections jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id as commit_id,
    c.user_id,
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'avatar_url', p.avatar_url
    ) as profile,
    c.title,
    c.type,
    c.recorded_at,
    c.duration_minutes,
    c.intensity,
    c.note,
    c.visibility,
    c.evidence,
    c.created_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'content', r.content,
          'type', r.type,
          'visibility', r.visibility,
          'created_at', r.created_at,
          'updated_at', r.updated_at
        )
        order by r.created_at asc
      ) filter (where r.id is not null),
      '[]'::jsonb
    ) as reflections
  from public.commits c
  join public.profiles p on p.id = c.user_id
  left join public.reflections r
    on r.commit_id = c.id
   and r.deleted_at is null
  where c.id = p_commit_id
    and c.deleted_at is null
  group by c.id, p.id, p.name, p.avatar_url;
$$;

grant execute on function public.get_circle_presence(uuid, timestamptz) to authenticated;
grant execute on function public.get_journey_timeline(uuid, integer, timestamptz) to authenticated;
grant execute on function public.get_shared_history(uuid, integer) to authenticated;
grant execute on function public.get_progress_summary(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.get_commit_detail(uuid) to authenticated;
