create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null
    constraint profiles_name_length_check
    check (char_length(btrim(name)) between 1 and 100),
  avatar_url text
    constraint profiles_avatar_url_length_check
    check (avatar_url is null or char_length(avatar_url) <= 500),
  bio text
    constraint profiles_bio_length_check
    check (bio is null or char_length(bio) <= 200),
  visibility_preference text not null default 'circle'
    constraint profiles_visibility_preference_check
    check (visibility_preference in ('private', 'circle', 'public')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
