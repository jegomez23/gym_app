# Playbooks

Question: How should common work be performed?

Last reviewed: 2026-06-19

## Universal Workflow

1. Read `CURRENT_STATE.md`.
2. Use `MAP.md` to select context.
3. Inspect current implementation.
4. Make the smallest coherent change.
5. Validate with available checks.
6. Update knowledge if reality changed.

## Create Feature

1. Confirm feature meaning in `DOMAIN.md`.
2. Confirm boundaries in `ARCHITECTURE.md`.
3. Check whether current code is still prototype or already feature-first.
4. Add code in the current architecture without pretending future structure
   already exists.
5. If introducing or moving to `features/`, keep imports one-way.
6. Add validation/tests proportional to risk.
7. Update `CURRENT_STATE.md` if implementation status changes.

## Create Component

1. Decide whether it is base UI, shared layout, shared gym UI, or feature-specific.
2. Prefer existing UI primitives and styling patterns.
3. Keep accessibility and mobile layout as baseline.
4. Avoid embedding domain data fetching in visual components.
5. Validate that text fits and interactions are reachable.

## Create Page Or Route

1. Read `ARCHITECTURE.md` and local Next.js docs.
2. Keep route files thin where possible.
3. Use Server Components by default when no browser interactivity is needed.
4. Isolate interactive parts in client components.
5. Update `MAP.md` if the route creates a new major area.

## Database Migration

1. Read `DATABASE.md`.
2. Resolve open contradictions that affect the migration before writing SQL.
3. Create migration files only once a migration system exists.
4. Include constraints, indexes, and RLS implications with the schema change.
5. Generate/update database types when tooling exists.
6. Update `DATABASE.md` and `CURRENT_STATE.md`.
7. Create an ADR for strategy-level changes.

## Bug Fix

1. Reproduce or reason from code until the cause is clear.
2. Fix the smallest responsible surface.
3. Add a regression test when tooling exists and risk justifies it.
4. If the bug reveals a durable pitfall, update `MEMORY.md`.

## Refactor

1. Define the behavior that must remain unchanged.
2. Avoid unrelated rewrites.
3. Preserve user changes in the worktree.
4. Validate after moving code.
5. Update `ARCHITECTURE.md` only if boundaries changed.

## Architecture Decision

1. Check `PRINCIPLES.md`.
2. Check current reality in `CURRENT_STATE.md`.
3. Compare options.
4. If the decision changes stack, data model, security, dependency direction, or
   long-term boundaries, create an ADR.
5. Update affected canonical files.

## Review

1. Prioritize bugs, regressions, missing validation, security, and test gaps.
2. Ground findings in file and line references.
3. Keep summaries secondary to findings.
4. If no issues are found, say so and name residual risk.

## Release

1. Run lint/build/tests available in the repo.
2. Check `CURRENT_STATE.md` for known blockers.
3. Confirm env vars and deployment assumptions.
4. Update release-relevant current state after deployment.
