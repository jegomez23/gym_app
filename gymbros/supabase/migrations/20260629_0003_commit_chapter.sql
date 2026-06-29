-- Chapters become living containers. A chapter (profiles.chapter, Phase 52) names the
-- season a person is living right now; this stamps each piece of evidence with the
-- season it was made within, so a season can later be re-read as the arc of evidence it
-- held. A denormalized copy of the user's own words at the moment of the act — not a
-- grouping table (the frozen MVP contract holds: no new table). Null for evidence made
-- with no chapter set, and for everything created before this column existed.
alter table public.commits
  add column if not exists chapter text;

alter table public.commits
  drop constraint if exists commits_chapter_length_check,
  add constraint commits_chapter_length_check
    check (
      chapter is null
      or char_length(btrim(chapter)) between 1 and 140
    );
