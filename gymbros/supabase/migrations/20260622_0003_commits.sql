create table if not exists public.commits (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text
    constraint commits_title_length_check
    check (title is null or char_length(btrim(title)) between 1 and 150),
  type text
    constraint commits_type_length_check
    check (type is null or char_length(btrim(type)) between 1 and 50),
  recorded_at timestamptz not null default now(),
  duration_minutes integer
    constraint commits_duration_minutes_check
    check (duration_minutes is null or duration_minutes > 0),
  intensity text
    constraint commits_intensity_check
    check (intensity is null or intensity in ('light', 'steady', 'deep')),
  note text
    constraint commits_note_length_check
    check (note is null or char_length(btrim(note)) between 1 and 500),
  visibility text not null default 'private'
    constraint commits_visibility_check
    check (visibility in ('private', 'circle', 'public')),
  evidence jsonb not null default '[]'::jsonb
    constraint commits_evidence_array_check
    check (public.is_limited_jsonb_array(evidence, 20)),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
