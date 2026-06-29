-- Public profiles become discoverable — the one missing policy proven necessary
-- across Phases 50–53. Public commits were already readable by any authenticated
-- user (commits_select_public_authenticated), but their author could not be read,
-- so a public document had no name or face. This adds attribution and nothing more:
-- a profile is visible to others only when the person explicitly chose
-- visibility_preference = 'public'. Two opt-ins (public profile + public commit)
-- are required before anything reaches Explore. No new table, no new column.
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles
  for select
  to authenticated
  using (
    visibility_preference = 'public'
    and deleted_at is null
  );
