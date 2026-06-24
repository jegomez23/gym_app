-- Identity statement: the user's own answer to "who am I becoming?".
-- One nullable field. Not a profile field in spirit — a vow the product remembers.
-- Kept short on purpose: a single sentence, never an essay.
alter table public.profiles
  add column if not exists identity_statement text;

alter table public.profiles
  drop constraint if exists profiles_identity_statement_length_check,
  add constraint profiles_identity_statement_length_check
    check (
      identity_statement is null
      or char_length(btrim(identity_statement)) between 1 and 140
    );
