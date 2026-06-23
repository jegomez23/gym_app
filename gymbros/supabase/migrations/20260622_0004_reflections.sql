create table if not exists public.reflections (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  commit_id uuid not null references public.commits(id) on delete cascade,
  content text not null
    constraint reflections_content_length_check
    check (char_length(btrim(content)) between 1 and 300),
  type text
    constraint reflections_type_check
    check (type is null or type in ('technical', 'emotional', 'identity', 'process')),
  visibility text not null default 'private'
    constraint reflections_visibility_check
    check (visibility in ('private', 'circle')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
