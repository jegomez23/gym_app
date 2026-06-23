# Agent Bootloader

This repository is optimized for AI-assisted development. Do not rely on chat
history as project memory; the repository is the source of truth.

This file is a compatibility shim. Start with `CLAUDE.md` for the canonical boot
sequence, decision tree, and rules.

---

## Truth Hierarchy

1. Code and config define current implementation reality.
2. `knowledge/CURRENT_STATE.md` summarizes what is true today.
3. `knowledge/PRINCIPLES.md`, `DOMAIN.md`, `ARCHITECTURE.md`, and `DATABASE.md`
   own canonical intent.
4. `knowledge/decisions/` explains major architectural decisions.
5. `docs/` is reference material, not the first entry point.

For why the product exists and what it must never become,
`knowledge/PRODUCT_BIBLE.md` is the highest source of truth, with
`knowledge/VOICE.md` (user-facing language) and `knowledge/PRINCIPLES.md`
(immutable product principles, never-build blacklist, Future Filter). On
product, identity, and voice questions, the Product Bible wins over everything
except code reality.

## Knowledge Updates

- Implementation reality changed: update `knowledge/CURRENT_STATE.md`.
- Architecture changed: update `knowledge/ARCHITECTURE.md`.
- Database changed: update `knowledge/DATABASE.md`.
- Major decision made: add an ADR in `knowledge/decisions/`.
- Durable lesson learned: update `knowledge/MEMORY.md`.
