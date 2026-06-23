alter table public.profiles
  add column if not exists username text,
  add column if not exists timezone text not null default 'UTC',
  add column if not exists locale text not null default 'en';

alter table public.profiles
  drop constraint if exists profiles_username_format_check,
  add constraint profiles_username_format_check
    check (
      username is null
      or username ~ '^[a-z0-9_]{3,30}$'
    );

alter table public.profiles
  drop constraint if exists profiles_timezone_length_check,
  add constraint profiles_timezone_length_check
    check (char_length(btrim(timezone)) between 1 and 80);

alter table public.profiles
  drop constraint if exists profiles_locale_length_check,
  add constraint profiles_locale_length_check
    check (char_length(btrim(locale)) between 2 and 20);

create unique index if not exists profiles_username_active_key
  on public.profiles (lower(username))
  where username is not null and deleted_at is null;
