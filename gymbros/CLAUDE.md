# Gym Circle — Claude Bootloader

**What**: A Next.js app that records disciplined action ("commits") and shares visibility with a private circle. Not a social network, not a habit tracker — an identity-reinforcement tool.

**Stage**: Early production. Auth/onboarding implemented. Supabase MVP migrations applied. Data flows through DAL + Server Actions.

---

## Boot Sequence

Always read in this order:

```
CLAUDE.md                          ← this file
knowledge/CURRENT_STATE.md         ← what is true today
knowledge/MAP.md                   ← route to task-specific context
```

Then load only the files listed for your task type below.

---

## Decision Tree

**Feature work** → `knowledge/PRINCIPLES.md` + `knowledge/DOMAIN.md` + `knowledge/ARCHITECTURE.md` + `knowledge/PLAYBOOKS.md`

**Database work** → `knowledge/DATABASE.md` + `knowledge/PLAYBOOKS.md`

**Auth work** → `knowledge/ARCHITECTURE.md` + `knowledge/DATABASE.md` + `lib/auth/session.ts` (canonical session pattern)

**Bug fix** → `knowledge/CURRENT_STATE.md` + `knowledge/PLAYBOOKS.md` + relevant feature code

**UI/component work** → `knowledge/PRINCIPLES.md` + `knowledge/ARCHITECTURE.md` + `knowledge/PLAYBOOKS.md`

**Architecture decision** → `knowledge/PRINCIPLES.md` + `knowledge/ARCHITECTURE.md` + `knowledge/decisions/`

**Product/domain decision** → `knowledge/PRINCIPLES.md` + `knowledge/DOMAIN.md`

**Refactor** → `knowledge/CURRENT_STATE.md` + `knowledge/ARCHITECTURE.md` + `knowledge/PLAYBOOKS.md`

---

## Rules (non-negotiable)

1. **DAL is the only data boundary** — Never call `supabase.from()` directly outside `lib/dal/`. proxy.ts is the one documented exception.
2. **Server-first** — Read and validate data on the server. Client components are for browser interactivity only.
3. **Mutations go through Server Actions** — Never write Supabase directly from the client.
4. **Services, not repositories** — Server Actions orchestrate DAL services. Do not import repositories or RPC directly from features. Use `createDomainDataLayer()` and go through `services.*`.
5. **Session pattern** — Use `lib/auth/session.ts` (specifically `requireProfile()`) for authenticated Server Actions. Map domain errors to UI state with the `actionErrorState`/`actionSuccessState` helpers in `features/shared/server/actionResult.ts`.
6. **Feature boundaries** — Features import from `lib/` and `components/`. Features never import from other features.
7. **TypeScript strict** — No `any`. Use `unknown` and validate.
8. **Validate everything** — Every Server Action validates with Zod. Client-side validation is UX, not security.
9. **Pass lint, typecheck, build, and tests** — Run all four before considering a change complete.
10. **Update knowledge** — If reality changed, update `knowledge/CURRENT_STATE.md` or the relevant canonical file.

---

## Knowledge Hierarchy

When information conflicts, this wins:

1. **Code and config** — What actually exists
2. **knowledge/CURRENT_STATE.md** — Summary of current truth
3. **knowledge/PRINCIPLES.md, DOMAIN.md, ARCHITECTURE.md, DATABASE.md** — Canonical intent
4. **knowledge/decisions/** — Architectural decision records
5. **docs/** — Reference material, may be stale

---

## Workflow

```
Understand task
  ↓
Read boot sequence + route from decision tree
  ↓
Inspect relevant implementation
  ↓
Plan change
  ↓
Implement (smallest coherent change)
  ↓
Validate: lint → typecheck → build → test
  ↓
Update knowledge if reality changed
```

---

## Validation

Every change must pass:

```bash
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run build        # next build
npm run test         # vitest run
```

---

## Key File Locations

| What                                | Where                                      |
| ----------------------------------- | ------------------------------------------ |
| Route pages                         | `app/[route]/`                             |
| Feature actions                     | `features/[domain]/actions/`               |
| Feature queries                     | `features/[domain]/queries/`               |
| Feature components                  | `features/[domain]/components/`            |
| UI primitives                       | `components/ui/`                           |
| Layout components                   | `components/layout/`                       |
| Gym-specific UI                     | `components/gym/`                          |
| DAL (repos/services/RPC)            | `lib/dal/`                                 |
| Supabase clients                    | `lib/supabase/`                            |
| Auth utilities                      | `lib/auth/`                                |
| Session/route guard                 | `lib/auth/session.ts` — `requireProfile()` |
| Middleware (utility, not automatic) | `proxy.ts`                                 |
| Migrations                          | `supabase/migrations/`                     |
| Database types                      | `supabase/types/`                          |
| ADRs                                | `knowledge/decisions/`                     |

---

## Stale Docs

These reference docs describe patterns that differ from current code:

- `docs/architecture/07-data-flow.md` — Shows direct `supabase.from()` in Server Components. Current architecture uses DAL.
- `docs/engineering/09-first-commit-plan.md` — Describes an already-completed phase.
- `docs/database/06-storage.md` — Storage not implemented in MVP.
- `docs/flows/` — May describe prototype flows, not current architecture.
