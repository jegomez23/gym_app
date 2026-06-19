# Agent Bootloader

This repository is optimized for AI-assisted development. Do not rely on chat
history as project memory; the repository is the source of truth.

## Boot Order

1. Read `knowledge/CURRENT_STATE.md`.
2. Read `knowledge/MAP.md` to route the task.
3. Read only the canonical files required by that route.
4. Inspect the implementation before editing.
5. Validate the change.
6. Update knowledge if reality changed.

## Truth Hierarchy

1. Code and config define current implementation reality.
2. `knowledge/CURRENT_STATE.md` summarizes what is true today.
3. `knowledge/PRINCIPLES.md`, `DOMAIN.md`, `ARCHITECTURE.md`, and `DATABASE.md`
   own canonical intent.
4. `knowledge/decisions/` explains major architectural decisions.
5. `docs/` is reference material, not the first entry point.

## Mandatory Next.js Rule

<!-- BEGIN:nextjs-agent-rules -->

This is NOT the Next.js you know. APIs, conventions, and file structure may
differ from training data. Before writing Next.js code, read the relevant guide
in `node_modules/next/dist/docs/` and heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Knowledge Updates

- Implementation reality changed: update `knowledge/CURRENT_STATE.md`.
- Architecture changed: update `knowledge/ARCHITECTURE.md`.
- Database changed: update `knowledge/DATABASE.md`.
- Major decision made: add an ADR in `knowledge/decisions/`.
- Durable lesson learned: update `knowledge/MEMORY.md`.
