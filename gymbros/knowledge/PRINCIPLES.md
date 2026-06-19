# Principles

Question: What must not be violated?

Last reviewed: 2026-06-19

## Product Invariants

- Personal progress should not be lived in isolation.
- The product exists to reduce abandonment of the person the user is trying to
  become.
- Community must create belonging, not comparison.
- Progress should become visible without becoming spectacle.
- The app should support continuity, not addiction.
- Simplicity must not remove emotional or identity depth.
- Success is process continuity, not time spent in the app.

## Architecture Laws

- Reality beats plans. Code and config define the implementation that exists.
- Server-first is the target: read and validate data on the server whenever
  possible.
- Client components are for browser interactivity, not default rendering.
- Mutations should go through server-controlled paths.
- Persistent domain data belongs in Supabase/PostgreSQL, not client stores.
- RLS is the final authorization boundary for database data.
- Feature boundaries should be explicit. Avoid cross-feature imports once the
  feature architecture exists.
- Shared code belongs in shared layers only when two or more features genuinely
  need it.

## Engineering Laws

- TypeScript strictness is not optional.
- Avoid `any`; use `unknown` and validate when the type is not known.
- Prefer explicit, readable code over clever abstractions.
- Do not abstract before there is real repetition or complexity.
- Errors should be visible, recoverable, and traceable.
- Accessibility and mobile usability are baseline requirements.
- Every meaningful task should leave project knowledge more accurate.

## Knowledge Laws

- One important concept has one canonical owner.
- Long docs are reference material, not entry points.
- Major architectural why belongs in ADRs.
- Current reality belongs in `CURRENT_STATE.md`.
- Do not duplicate instructions across agent-specific files.
- If two sources disagree, document the contradiction before resolving it.

## Reference Sources

- `docs/01-truth.md`
- `docs/02-manifesto.md`
- `docs/architecture/00-project-architecture.md`
- `docs/architecture/02-development-rules.md`
- `docs/engineering/00-engineering-principles.md`
