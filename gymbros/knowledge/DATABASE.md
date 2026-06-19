# Database

Question: How is data modeled and protected?

Last reviewed: 2026-06-19

## Current Reality

No database schema, migrations, RLS policies, generated types, or Supabase local
configuration exist in the repository yet.

`lib/supabase/client.ts` can create a browser Supabase client if
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured,
but the app currently uses mock data.

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
