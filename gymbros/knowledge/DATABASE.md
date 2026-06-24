# Database

Question: How is data modeled and protected?

Last reviewed: 2026-06-22

## Current Reality

The repository now contains the initial Supabase/PostgreSQL MVP database
implementation under `supabase/`.

Implemented database infrastructure:

- `supabase/config.toml` configures the local Supabase project and seed path.
- `supabase/migrations/20260622_0001_extensions.sql` through
  `20260622_0012_profile_lifecycle.sql` implement extensions, tables, indexes,
  triggers, RLS, views, derived RPC functions, and additive profile lifecycle
  fields.
- `supabase/migrations/20260623_0001_social_core.sql` adds the `notifications`
  table (with RLS, indexes), the `circle_memberships.invited_by` column, an
  expanded membership status check (`pending|active|paused|ended`), a
  discoverable-profiles select policy, and a reciprocity trigger update.
- `supabase/seed.sql` contains minimal local development/demo data.
- `supabase/types/database.generated.ts` contains database types aligned with
  the implemented MVP schema.
- `lib/supabase/client.ts` and `server.ts` are typed with the database contract.
  Session refresh/route protection lives in root `proxy.ts` (Next.js 16 renamed
  the `middleware.ts` convention to `proxy.ts`).

The main app routes now use Supabase through `lib/dal/` and feature query
modules. Mutations that exist today are routed through Server Actions and DAL
services. Auth and onboarding screens create sessions and complete profiles
without manual database intervention.

## Canonical MVP Data Contract

The definitive MVP database contract is
`docs/database/12-mvp-data-contract.md`.

It freezes these decisions:

- Reflection only exists when attached to a Commit.
- Circle bidirectionality belongs to the database.
- MVP persistent entities are only `auth.users`, `profiles`, `commits`,
  `reflections`, `circle_memberships`, and `supports`.
- `progress_snapshots`, journeys, identities, knowledge, mood, and stored
  presence are not MVP tables.
- Commit content is practically immutable; only operational fields such as
  `visibility` and `deleted_at` may change.
- Supabase CLI migrations are the only official schema source once
  implementation begins.

## Derived Concepts

These should not have MVP tables unless performance proves otherwise:

- Identity
- Presence
- Progress
- Journey
- Shared History

They are calculated from persistent records, mainly Commits and Circle
relationships.

## RLS Philosophy

- RLS is mandatory for user-owned and Circle-visible data.
- Policies must protect data even if application code is wrong.
- Users can read and mutate their own permitted rows.
- Circle visibility must only expose data to allowed Circle members.
- Public visibility must be explicit.
- Service-role access must never be exposed to the client.

## Migration Philosophy

- Schema changes must be represented as migrations once database work begins.
- Existing applied migrations should not be edited; create new migrations.
- Seeds are development data, not production schema.
- Rollback strategy should be explicit for destructive operations.

## Implemented MVP Infrastructure

Tables:

- `profiles`
- `commits`
- `reflections`
- `circle_memberships`
- `supports`
- `notifications` (added in `20260623_0001_social_core.sql`; RLS-scoped to the
  recipient, soft-deletable, types: `support_received`, `circle_invitation`,
  `invitation_accepted`, `reflection_received`)

Triggers enforce:

- profile creation from Supabase Auth users
- `updated_at` for editable tables
- Commit content immutability
- Reflection ownership matching its Commit
- Circle membership reciprocity
- Support creation only between active Circle members

Views:

- `active_circle_memberships`
- `visible_commits`
- `commit_reflection_counts`
- `support_history`

RPC functions:

- `get_circle_presence`
- `get_journey_timeline`
- `get_shared_history`
- `get_progress_summary`
- `get_commit_detail`

Profile lifecycle fields:

- `username`
- `timezone`
- `locale`
- `identity_statement` (added in `20260624_0001_identity_statement.sql`; nullable,
  1–140 chars, the user's own answer to "who am I becoming?" — see DOMAIN/identity)

`username` is nullable while a profile is pending onboarding and unique for
active, non-deleted profiles.

## Open Database Decisions

These require ADRs or implementation-time resolution:

- Whether Drizzle ORM is actually adopted or removed from the planned stack.

## Reference Sources

- `docs/database/00-persistence-model.md`
- `docs/database/01-entity-relationship.md`
- `docs/database/02-schema-design.md`
- `docs/database/03-relations.md`
- `docs/database/04-indexing.md`
- `docs/database/05-row-level-security.md`
- `docs/database/07-triggers-functions.md`
- `docs/database/08-migrations.md`
- `docs/database/09-supabase-implementation.md`
- `docs/database/10-query-strategy.md`
- `docs/database/11-database-roadmap.md`
- `docs/database/12-mvp-data-contract.md`
- `docs/database/13-data-infrastructure-plan.md`
