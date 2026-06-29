import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

function migration(name: string) {
  return readFileSync(join(migrationsDir, name), "utf8");
}

const combinedSql = migrationFiles.map(migration).join("\n");

describe("Supabase MVP migrations", () => {
  it("keeps migrations focused and ordered", () => {
    expect(migrationFiles).toEqual([
      "20260622_0001_extensions.sql",
      "20260622_0002_profiles.sql",
      "20260622_0003_commits.sql",
      "20260622_0004_reflections.sql",
      "20260622_0005_circle_memberships.sql",
      "20260622_0006_supports.sql",
      "20260622_0007_indexes.sql",
      "20260622_0008_triggers.sql",
      "20260622_0009_rls.sql",
      "20260622_0010_views.sql",
      "20260622_0011_functions.sql",
      "20260622_0012_profile_lifecycle.sql",
      "20260623_0001_social_core.sql",
      "20260624_0001_identity_statement.sql",
      "20260625_0001_progress_summary_lifetime.sql",
      "20260625_0002_shared_presence.sql",
      "20260629_0001_chapter.sql",
      "20260629_0002_profiles_select_public.sql",
      "20260629_0003_commit_chapter.sql",
    ]);
  });

  it("carries shared presence on the notifications type, never a new table", () => {
    const sharedPresence = migration("20260625_0002_shared_presence.sql");

    expect(sharedPresence).toContain("alter table public.notifications");
    expect(sharedPresence).toContain("'shared_presence'");
    expect(sharedPresence).not.toMatch(/create table/i);
  });

  it("makes get_progress_summary an all-time identity signal, not a 30-day window", () => {
    const lifetime = migration("20260625_0001_progress_summary_lifetime.sql");

    expect(lifetime).toContain(
      "create or replace function public.get_progress_summary"
    );
    expect(lifetime).toContain("p_from timestamptz default '-infinity'");
    expect(lifetime).not.toMatch(/interval '30 days'/);
  });

  it("adds the nullable identity statement field only", () => {
    const identity = migration("20260624_0001_identity_statement.sql");

    expect(identity).toContain(
      "add column if not exists identity_statement text"
    );
    expect(identity).toContain("profiles_identity_statement_length_check");
    expect(identity).not.toMatch(/create table/i);
  });

  it("adds the nullable chapter field only", () => {
    const chapter = migration("20260629_0001_chapter.sql");

    expect(chapter).toContain("add column if not exists chapter text");
    expect(chapter).toContain("profiles_chapter_length_check");
    expect(chapter).not.toMatch(/create table/i);
  });

  it("stamps evidence with its season as a nullable column, never a new table", () => {
    const commitChapter = migration("20260629_0003_commit_chapter.sql");

    expect(commitChapter).toContain(
      "alter table public.commits\n  add column if not exists chapter text"
    );
    expect(commitChapter).toContain("commits_chapter_length_check");
    expect(commitChapter).not.toMatch(/create table/i);
  });

  it("makes public profiles discoverable for attribution, as a policy only", () => {
    const publicProfiles = migration(
      "20260629_0002_profiles_select_public.sql"
    );

    expect(publicProfiles).toContain(
      "create policy profiles_select_public on public.profiles"
    );
    expect(publicProfiles).toContain("visibility_preference = 'public'");
    expect(publicProfiles).not.toMatch(/create table/i);
    expect(publicProfiles).not.toMatch(/add column/i);
  });

  it("adds profile lifecycle fields without adding non-MVP tables", () => {
    const lifecycle = migration("20260622_0012_profile_lifecycle.sql");

    expect(lifecycle).toContain("add column if not exists username text");
    expect(lifecycle).toContain("add column if not exists timezone text");
    expect(lifecycle).toContain("add column if not exists locale text");
    expect(lifecycle).toContain("profiles_username_active_key");
  });

  it("creates only the canonical MVP domain tables plus Phase 7 notifications", () => {
    const createdTables = [
      ...combinedSql.matchAll(/create table if not exists public\.([a-z_]+)/g),
    ].map((match) => match[1]);

    expect(createdTables).toEqual([
      "profiles",
      "commits",
      "reflections",
      "circle_memberships",
      "supports",
      "notifications",
    ]);
    expect(createdTables).not.toContain("progress_snapshots");
    expect(createdTables).not.toContain("journeys");
    expect(createdTables).not.toContain("moods");
    expect(createdTables).not.toContain("presence");
  });

  it("keeps Reflections attached to Commits and Commit content immutable", () => {
    expect(migration("20260622_0004_reflections.sql")).toContain(
      "commit_id uuid not null references public.commits(id) on delete cascade"
    );
    expect(migration("20260622_0008_triggers.sql")).toContain(
      "create or replace function public.enforce_commit_immutability()"
    );
    expect(migration("20260622_0008_triggers.sql")).toContain(
      "raise exception 'commit content is immutable'"
    );
  });

  it("enforces Circle reciprocity and Support creation rules in the database", () => {
    const triggers = migration("20260622_0008_triggers.sql");

    expect(triggers).toContain(
      "create or replace function public.sync_circle_membership_reciprocity()"
    );
    expect(triggers).toContain("pg_trigger_depth() > 1");
    expect(triggers).toContain(
      "support requires an active Circle relationship"
    );
    expect(triggers).toContain("cm.status = 'active'");
  });

  it("enables RLS for every domain table without physical DELETE policies", () => {
    const rls = combinedSql;

    for (const table of [
      "profiles",
      "commits",
      "reflections",
      "circle_memberships",
      "supports",
      "notifications",
    ]) {
      expect(rls).toContain(
        `alter table public.${table} enable row level security`
      );
    }

    expect(rls).not.toMatch(/for delete/i);
  });

  it("adds pending Circle invitations and persisted notifications", () => {
    const socialCore = migration("20260623_0001_social_core.sql");

    expect(socialCore).toContain("add column if not exists invited_by uuid");
    expect(socialCore).toContain(
      "check (status in ('pending', 'active', 'paused', 'ended'))"
    );
    expect(socialCore).toContain(
      "create table if not exists public.notifications"
    );
    expect(socialCore).toContain("notifications_select_recipient");
  });

  it("exposes only documented views and derived RPC functions", () => {
    const views = migration("20260622_0010_views.sql");
    const functions = migration("20260622_0011_functions.sql");

    for (const view of [
      "active_circle_memberships",
      "visible_commits",
      "commit_reflection_counts",
      "support_history",
    ]) {
      expect(views).toContain(`view public.${view}`);
      expect(views).toContain("with (security_invoker = true)");
    }

    for (const fn of [
      "get_circle_presence",
      "get_journey_timeline",
      "get_shared_history",
      "get_progress_summary",
      "get_commit_detail",
    ]) {
      expect(functions).toContain(`function public.${fn}`);
      expect(functions).toContain("security invoker");
    }
  });
});
