# Memory

Question: What durable lessons must not be forgotten?

Last reviewed: 2026-06-19

## Known Pitfalls

- Do not assume reference docs describe implemented reality. Check
  `CURRENT_STATE.md` and code first.
- Do not move the entire `docs/` tree just to make the knowledge system look
  cleaner. It is valuable reference material.
- Do not put persistent domain data in Zustand as the product matures.
- Do not let route files become permanent feature containers.
- Do not duplicate agent instructions across AGENTS, Claude, Copilot, Cursor, or
  other tool-specific files.
- Do not silently resolve contradictions from memory. Record them.

## Architectural Scars

- The project began with rich long-form docs before it had a canonical operating
  layer. This created duplicated planned truth. The kernel exists to prevent
  future drift.
- The current app is a prototype that demonstrates product feel but does not yet
  implement the documented server-first architecture.

## Tradeoffs

- The kernel intentionally avoids a machine-readable graph for now. A manual
  graph would likely become stale before tooling exists.
- Existing docs remain in place to avoid churn. Authority is changed by routing,
  not by moving files.
- ADRs are reserved for major decisions to prevent decision-record fatigue.

## When To Add Memory

Add to this file only when a lesson is likely to prevent future mistakes.
Temporary notes, task checklists, and short-term plans belong elsewhere or should
not be documented.
