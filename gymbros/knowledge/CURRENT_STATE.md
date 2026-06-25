# Current State

Question: What is true today?

Last reviewed: 2026-06-23 (Production Hardening — Phase 13)

## Project Stage

Gym Circle is an early production foundation with a substantial reference
documentation set. The current application keeps the mobile-first UI direction
but now reads domain data through Supabase-backed DAL services and writes through
Server Actions.

The application now has an email/password authentication and onboarding
foundation. Route-level mock state has been removed.

## Installed Stack

| Area             | Current reality                                                   |
| ---------------- | ----------------------------------------------------------------- |
| Framework        | Next.js `16.2.7`                                                  |
| React            | `19.2.4`                                                          |
| TypeScript       | `6.0.3`, strict enabled                                           |
| Styling          | Tailwind CSS `4` via `@tailwindcss/postcss`                       |
| Backend SDK      | `@supabase/supabase-js` `2.106.2`, `@supabase/ssr` `0.12.0`       |
| Validation/forms | Zod `4.4.3` (server-side, the validation boundary)              |
| Realtime         | Supabase Realtime postgres_changes channels (`useSupabase`)       |
| Client state     | React local state only for current UI interactions                |
| Testing          | Vitest `4.1.9`, Testing Library, jsdom                            |
| Formatting       | Prettier `3.8.4`, EditorConfig                                    |
| Database tooling | Supabase CLI dependency and versioned MVP migrations exist        |

Planned but not installed: shadcn/ui, Drizzle ORM, Playwright. TanStack Query
was removed in Phase 13: it was installed but had zero `useQuery`/`useMutation`
consumers. Client server-state needs are met by Server Actions plus Supabase
Realtime + `router.refresh()`. Reinstall only when client-side caching or
optimistic UI is genuinely required. React Hook Form + `@hookform/resolvers`
were removed in Phase 31 for the same reason: the commit flow was the last
consumer, and it was triple-tracking state (local + RHF + hidden inputs) while
the Server Action's Zod schema was already the real validation boundary. Forms
now use plain controlled state + native inputs validated on the server.

## Implementation Reality

Current code shape:

- `app/` contains route pages and page-level UI logic.
- `components/layout/` and `components/ui/` contain shared UI components.
  `components/ui/` holds the Phase 16 design system: token-driven primitives
  (`AppButton`, `AppCard` hero/primary/quiet levels, `Field`/`Input`/`Textarea`/
  `Select`, `Icon`, `Avatar`, `StatBlock`, `PillOption`). Design tokens
  (type scale, radius, elevation, motion, color semantics) live in
  `app/globals.css` and are the single source of truth — components reference
  tokens, never hardcoded values.
- `features/` owns route-specific query/view/action code for Today, Commit,
  Circle, Archive, Profile, Auth, Onboarding, Notifications, and shared feature
  primitives.
- The emotional product layer (Phase 20 implementation) is client-only and
  reuses existing data: Today shows an identity hero with a Quiet Return state
  and human presence lines (derived from `progress`/`presence`); the Commit flow
  resurfaces the last reflection as memory (via `journey.getJourney`) and hides
  duration behind progressive disclosure; notifications acknowledge on card tap
  (no admin chrome); sending Support shows a quiet confirmation. No schema,
  Server Action, or DAL changes were made for these.
- Phase 22 (Identity Becomes Personal) added the identity spine: a single
  nullable `profiles.identity_statement` field (migration
  `20260624_0001_identity_statement.sql`, generated types, DAL type/mapper/
  schemas/repository, and Zod validation in `lib/auth/schemas.ts`). Onboarding
  now leads with one quiet question ("¿En quién te estás convirtiendo?")
  instead of bio-first; the statement is the optional emotional center. It is
  integrated only where it increases meaning: the Today Quiet Return moment
  echoes the user's own words, the Commit recognition moment ("Apareciste.")
  echoes the vow the just-sealed action proves, and Profile became a mirror
  whose hero is the statement (with a calm inline edit). The statement is the
  user's words, never copy we generate.
- Phase 23 (World-Class Product Review) removed leftover habit-tracker and
  self-referential chrome: the Today daily commit-count line, the Archive
  metrics card (the evidence cards are the record), the Profile evidence tally,
  the Profile "círculo privado" count card, and the Profile "Principios del
  producto" list (the product no longer advertises its own philosophy — it
  lives it). The Profile edit form was reduced from a settings panel to a
  mirror: identity statement, name, username, and the privacy control only;
  bio, avatar-URL, timezone, and locale fields were removed from the surface
  (their columns and values are untouched — onboarding still captures timezone/
  locale automatically). `getProfileViewModel` now loads only the profile
  (three unused circle/progress queries removed). No schema changes.
- Phase 24 (Memory Selection Engine) is **design only — not built**. It adds a
  canonical knowledge document, `knowledge/MEMORY_SELECTION_ENGINE.md`, defining
  how the product decides which single piece of a user's own past (if any) returns
  at a given moment, with silence as the default output. No code, schema, UI, or
  Server Action was added; the existing client-only resurfacing (Quiet Return echo,
  Commit recognition's last-reflection memory) is the current partial reality this
  document will eventually govern.
- Phase 25 (Memory Governance & Evolution) is **design only — not built**. It adds
  `knowledge/MEMORY_GOVERNANCE.md`, the constitutional layer above the Memory
  Selection Engine: the immutable principles that may never change, the rules for
  what counts as allowed evolution vs. drift, a fixed decision framework, the trust
  budget, a memory review checklist, and explicit Selection Policy versioning. The
  authority chain is Product Bible → Principles → Memory Governance → Memory
  Selection Engine → implementation. No code, schema, UI, or Server Action added.
- Phase 26 (Emotional Interaction System) is **design only — not built**. It adds
  `knowledge/INTERACTION_SYSTEM.md`, the canonical behavior layer: the qualities
  every interaction must produce (calm, certainty, warmth, dignity, continuity,
  restraint), 14 immutable interaction principles, the Arrival→Orientation→Action→
  Recognition→Rest rhythm, and philosophies for motion, feedback, silence, errors,
  human presence, and future-surface compatibility. It governs how the product
  behaves, sitting above implementation and below the memory layer in the hierarchy.
  No code, schema, UI, or Server Action added.
- Phase 27 (State System) is **design only — not built**. It adds
  `knowledge/STATE_SYSTEM.md`, the canonical set of human states the product serves
  (Beginning, Building, Returning, Protected, Witnessed, Supported, Reflecting,
  Waiting, Alone, Resting, Transitioning), each with its product response, a
  deterministic state-priority order (human state always beats feature context), the
  invalid states Gym Circle refuses to create, and the hard engineering boundary that
  state is derived from evidence, never inferred emotion. It sits below the
  Interaction System and above implementation: implementation begins from a human
  state, not a screen. No code, schema, UI, or Server Action added.
- Circle and Notifications use client Supabase Realtime hooks
  (`useCircleRealtime`, `useNotificationsRealtime`) that refresh the server tree
  on `postgres_changes`. `app/providers.tsx` exposes the browser Supabase client
  via `useSupabase` for these subscriptions.
- `lib/supabase/` exposes browser, server, and proxy helper foundations typed
  with the database contract.
- `lib/dal/` contains the domain Data Access Layer: repositories, services, RPC
  wrappers, mappers, validators, domain types, and error translation.
- `supabase/` contains local config, focused MVP migrations, local seed data,
  functions folder, and checked-in database types.
- `app/providers.tsx` wires the browser Supabase client context (`useSupabase`)
  and a no-op Theme provider placeholder.
- Prototype runtime stores and mock data files have been removed.

Current routes:

- `/` public/auth-aware today hub
- `/login` email/password login
- `/signup` email/password signup
- `/forgot-password` password reset request
- `/reset-password` password update form
- `/onboarding` pending-profile completion
- `/commit` commit creation flow
- `/circle` circle overview
- `/archive` commit archive
- `/profile` profile summary
- `/auth/callback` Supabase email confirmation/recovery callback

## Architecture Reality

The reference docs describe a future architecture:

- `features/` directories
- Server Components by default
- Server Actions for mutations
- TanStack Query for server state in client components
- Zod and React Hook Form for validation and forms
- Supabase Auth, RLS, Storage, Realtime, and migrations

The main route surfaces now follow this direction: route pages are server
orchestrators, reads go through feature query modules and DAL services, and
mutations use Server Actions. Client components are limited to form/UI
interaction.

Authentication now follows the same server-first direction: forms call Server
Actions, auth/profile mutations go through DAL services, `proxy.ts` refreshes
sessions and redirects protected routes, and completed profiles are required for
private app features.

## Known Contradictions

| Topic                   | Current mismatch                                                                                                                                         | Status                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Next version            | Prompts/reference mention Next.js 15; `package.json` uses Next `16.2.7`.                                                                                 | Open                    |
| Installed stack         | Zod, RHF, TanStack Query, Supabase SSR, Vitest, Testing Library, and Prettier are installed; shadcn/ui, Drizzle, and Playwright are not.                 | Partially resolved      |
| Architecture            | Main route surfaces and Auth/Onboarding now use feature modules, server reads, Server Actions, and route protection.                                     | Partially resolved      |
| Database table count    | Canonical MVP contract freezes `auth.users`, `profiles`, `commits`, `reflections`, `circle_memberships`, and `supports`; no `progress_snapshots` in MVP. | Resolved                |
| Circle bidirectionality | Canonical MVP contract assigns reciprocity to the database.                                                                                              | Resolved                |
| Migrations              | Supabase CLI is canonical; `supabase/migrations/` now contains the initial MVP schema, indexes, triggers, RLS, views, and functions.                     | Resolved                |
| README                  | Previously default Next README; now replaced with project overview.                                                                                      | Resolved                |
| AI entry point          | Previously AGENTS only warned about Next; now bootloader routes to kernel.                                                                               | Resolved                |
| Middleware              | Next.js 16 deprecated `middleware.ts` and renamed the convention to `proxy.ts`. `proxy.ts` at root IS the active middleware. Was never broken.           | Resolved                |
| DAL access pattern      | `proxy.ts` queries `supabase.from("profiles")` directly. Acceptable: proxy/edge runtime cannot use `server-only` DAL imports. Documented as intentional. | Resolved (accepted)     |
| Data flow doc           | `docs/architecture/07-data-flow.md` shows `supabase.from()` in Server Components; current architecture routes reads through DAL services.                | Resolved (marked stale) |
| Session patterns        | `requireDomainSession` and `getDomainSession` removed from `domainData.ts` (zero consumers). `requireProfile` from `lib/auth/session.ts` is canonical.   | Resolved                |
| MEMORY.md               | Described current app as "prototype"; CURRENT_STATE.md describes early production foundation.                                                            | Resolved                |
| First commit plan       | `docs/engineering/09-first-commit-plan.md` describes an already-executed initial setup.                                                                  | Resolved (marked stale) |
| Storage docs            | `docs/database/06-storage.md` describes Storage buckets not implemented in MVP.                                                                          | Resolved (marked stale) |
| Dead directories        | `store/` and `data/` directories removed. `lib/supabase/middleware.ts` removed (zero consumers, redundant with `proxy.ts`).                              | Resolved                |

## Active Roadmap

1. Stabilize the knowledge kernel.
2. Decide and record ADRs for open contradictions that affect implementation.
3. Align dependencies with the chosen stack.
4. Move prototype code toward the canonical architecture incrementally.
5. Build advanced product features on top of the authenticated lifecycle.

## Technical Debt

- Full runtime RLS coverage still needs a running Supabase database.
- Auth is email/password only; OAuth is not implemented. Circle invitations and
  in-app notifications (Supabase Realtime) are implemented; email/push delivery
  of notifications is not.
- Some historical reference docs still describe the previous client-store
  prototype shape.
- Database tests currently verify migration contract from files.
- Long reference docs contain duplicated and conflicting truth.
- The `ChapterCard` decorative placeholder was removed in Phase 16 (Design
  System) along with the now-empty `components/gym/` directory.

## Reference Sources

- Product philosophy: `docs/00-observations.md`, `docs/01-truth.md`,
  `docs/02-manifesto.md`
- Memory selection (designed, not built): `knowledge/MEMORY_SELECTION_ENGINE.md`
- Memory governance / constitution (designed, not built): `knowledge/MEMORY_GOVERNANCE.md`
- Interaction / behavior system (designed, not built): `knowledge/INTERACTION_SYSTEM.md`
- State system / where the person is (designed, not built): `knowledge/STATE_SYSTEM.md`
- Product/domain map: `docs/product/00-product-map.md`
- Architecture reference: `docs/architecture/`
- Engineering reference: `docs/engineering/`
- Database reference: `docs/database/`
- Domain reference: `docs/domain/`
