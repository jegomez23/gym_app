# Decisions

Question: Why were major choices made?

ADRs are required only for decisions that change or lock in long-term project
direction.

## ADR Required

Create an ADR for:

- technology stack changes
- architecture boundaries
- database strategy or schema direction
- security, auth, or RLS model
- dependency direction rules
- irreversible or expensive tradeoffs
- replacing a canonical principle

## ADR Not Required

Do not create ADRs for:

- local refactors
- component extraction
- UI copy changes
- folder renames without boundary changes
- bug fixes without architectural consequence
- patch dependency upgrades

## Format

Use `ADR-0001-template.md`. Number ADRs sequentially. If an ADR supersedes an
older one, say so explicitly in both records.
