# Map

Question: What context should I load for a task?

Last reviewed: 2026-06-19

Always start with:

1. `knowledge/CURRENT_STATE.md`
2. this file
3. only the additional files listed for the task

## Task Routes

| Task                    | Required canonical context                                      | Optional reference                                                      |
| ----------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| New feature             | `PRINCIPLES.md`, `DOMAIN.md`, `ARCHITECTURE.md`, `PLAYBOOKS.md` | relevant `docs/domain/`, `docs/architecture/03-feature-architecture.md` |
| UI/component work       | `PRINCIPLES.md`, `INTERACTION_SYSTEM.md`, `ARCHITECTURE.md`, `PLAYBOOKS.md` | `docs/engineering/07-accessibility.md`, existing `components/`          |
| Interaction / behavior / feel | `PRODUCT_BIBLE.md`, `VOICE.md`, `PRINCIPLES.md`, `INTERACTION_SYSTEM.md` | existing `components/`, relevant feature flow                  |
| Human state / where the person is | `PRODUCT_BIBLE.md`, `INTERACTION_SYSTEM.md`, `STATE_SYSTEM.md`, `MEMORY_SELECTION_ENGINE.md` | `DATABASE.md` (evidence substrate)        |
| Page or route work      | `ARCHITECTURE.md`, `PLAYBOOKS.md`                               | `docs/architecture/05-routing.md`, relevant `app/` route                |
| State management        | `ARCHITECTURE.md`, `CURRENT_STATE.md`                           | `docs/architecture/04-state-management.md`                              |
| Database work           | `DATABASE.md`, `PLAYBOOKS.md`                                   | `docs/database/`                                                        |
| Auth work               | `ARCHITECTURE.md`, `DATABASE.md`, `PLAYBOOKS.md`                | `docs/architecture/06-authentication.md`                                |
| Bug fix                 | `CURRENT_STATE.md`, `PLAYBOOKS.md`, relevant canonical owner    | nearby code and tests                                                   |
| Refactor                | `CURRENT_STATE.md`, `ARCHITECTURE.md`, `PLAYBOOKS.md`           | relevant architecture reference                                         |
| Architecture decision   | `PRINCIPLES.md`, `ARCHITECTURE.md`, `decisions/README.md`       | existing ADRs and relevant reference docs                               |
| Product/domain decision | `PRINCIPLES.md`, `DOMAIN.md`                                    | `docs/00-observations.md`, `docs/01-truth.md`, `docs/02-manifesto.md`   |
| Memory / resurfacing work | `PRODUCT_BIBLE.md`, `PRINCIPLES.md`, `VOICE.md`, `MEMORY_SELECTION_ENGINE.md` | `DATABASE.md` (evidence substrate)                       |
| Changing the memory system itself | `PRODUCT_BIBLE.md`, `PRINCIPLES.md`, `MEMORY_GOVERNANCE.md`, `MEMORY_SELECTION_ENGINE.md` | `decisions/` (Selection Policy version ADRs)   |
| Release/deploy          | `CURRENT_STATE.md`, `PLAYBOOKS.md`                              | `docs/engineering/08-definition-of-done.md`                             |

## Code Routing

| Area            | Current location          | Target location                                |
| --------------- | ------------------------- | ---------------------------------------------- |
| Routes          | `app/`                    | `app/`                                         |
| Feature UI      | `app/`, `components/gym/` | `features/[feature]/components/`               |
| Shared layout   | `components/layout/`      | `components/layout/`                           |
| Base UI         | `components/ui/`          | `components/ui/`                               |
| Mock data       | `data/`                   | Replace with Supabase/server data              |
| Client stores   | `store/`                  | UI-only stores; domain data moves out          |
| Supabase client | `lib/supabase/client.ts`  | add server/middleware clients when auth begins |

## Next.js Routing Note

Before editing Next.js APIs or conventions, read the relevant local docs under
`node_modules/next/dist/docs/`.
