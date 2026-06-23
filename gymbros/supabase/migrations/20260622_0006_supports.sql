create table if not exists public.supports (
  id uuid primary key default extensions.gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null
    constraint supports_message_length_check
    check (char_length(btrim(message)) between 1 and 200),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint supports_no_self_check check (from_user_id <> to_user_id)
);
