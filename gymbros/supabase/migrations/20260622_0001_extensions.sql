create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_limited_jsonb_array(
  value jsonb,
  max_items integer
)
returns boolean
language sql
immutable
strict
as $$
  select case
    when jsonb_typeof(value) = 'array' then jsonb_array_length(value) <= max_items
    else false
  end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_name text;
begin
  profile_name := left(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(split_part(new.email, '@', 1)), ''),
      'Usuario'
    ),
    100
  );

  insert into public.profiles (id, name)
  values (new.id, profile_name)
  on conflict (id) do nothing;

  return new;
end;
$$;
