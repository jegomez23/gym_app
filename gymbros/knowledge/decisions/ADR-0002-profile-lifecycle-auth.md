# ADR-0002: Profile Lifecycle Through Pending Profiles

Date: 2026-06-22

## Status

Accepted

## Context

Supabase Auth creates `auth.users`, and the existing database trigger creates a
minimal `profiles` row immediately after signup. Phase 6 requires a complete
user lifecycle with username, display name, avatar placeholder, timezone,
locale, onboarding completion, and no manual database intervention.

The existing `profiles` table did not include username, timezone, or locale, so
the lifecycle could not be represented safely with only application code.

## Decision

Keep automatic pending profile creation through the existing trigger.

Add an additive migration for profile lifecycle fields:

- nullable `username`
- non-null `timezone`
- non-null `locale`
- unique active username index

Onboarding updates the pending profile through DAL services and marks
`onboarding_completed = true`. If the trigger ever fails, onboarding can insert
the profile through the same DAL service as a fallback.

## Consequences

- New users can sign up, confirm if required, complete onboarding, and enter the
  app without manual database work.
- Pending profiles can exist with `username = null`, which allows the auth
  trigger to stay simple and reliable.
- Username uniqueness is enforced by PostgreSQL, with Server Action validation
  and friendly conflict messages in the UI.
- The schema remains within the MVP profile table instead of adding new user
  lifecycle tables.
