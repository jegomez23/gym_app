-- Chapter: the season of practice the person is living *right now*.
-- One nullable field, like the identity statement — but present tense, not permanent.
-- Identity statement answers "who am I becoming?"; the chapter answers "what am I
-- living through now?" (preparing for a race, coming back from injury, a winter of
-- hiking). It changes and can be cleared when the season ends. Kept short on
-- purpose: a single line in the user's own words, never an essay.
alter table public.profiles
  add column if not exists chapter text;

alter table public.profiles
  drop constraint if exists profiles_chapter_length_check,
  add constraint profiles_chapter_length_check
    check (
      chapter is null
      or char_length(btrim(chapter)) between 1 and 140
    );
