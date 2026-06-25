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

| Area             | Current reality                                             |
| ---------------- | ----------------------------------------------------------- |
| Framework        | Next.js `16.2.7`                                            |
| React            | `19.2.4`                                                    |
| TypeScript       | `6.0.3`, strict enabled                                     |
| Styling          | Tailwind CSS `4` via `@tailwindcss/postcss`                 |
| Backend SDK      | `@supabase/supabase-js` `2.106.2`, `@supabase/ssr` `0.12.0` |
| Validation/forms | Zod `4.4.3` (server-side, the validation boundary)          |
| Realtime         | Supabase Realtime postgres_changes channels (`useSupabase`) |
| Client state     | React local state only for current UI interactions          |
| Testing          | Vitest `4.1.9`, Testing Library, jsdom                      |
| Formatting       | Prettier `3.8.4`, EditorConfig                              |
| Database tooling | Supabase CLI dependency and versioned MVP migrations exist  |

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
- Phase 33 (Perception Audit — Arrival) is **built**. `components/layout/RouteSkeleton.tsx`
  now exports per-route arrival skeletons (`RouteSkeleton` for Today, plus
  `CommitSkeleton`, `ArchiveSkeleton`, `ProfileSkeleton`, `CircleSkeleton`), each
  reusing the exact `AppCard` shells of the screen it stands in for so the real
  content swaps in without the frame jumping — only text fills. The anxious
  Tailwind `animate-pulse` was replaced by a single calm `.skeleton` shimmer
  (globals.css `@keyframes shimmer`, ~2.4s, all placeholders sweep in unison),
  which `prefers-reduced-motion` resolves to a still fill. This is the
  Interaction System's motion/silence philosophy applied to first paint: the
  screen arrives, it does not "load".
- Phase 34 (Perception Audit — Arrival, cont.) is **built**. It removed the
  route-transition double-motion: after the (now matched-shell) skeleton settled
  the layout, the screen used to re-enact an entrance — `ScreenContainer` rose its
  header and hero (`animate-rise`) and stagger-rose its body (`.stagger-children`,
  translateY per child). Static shimmer → sequential slide-in was the seam. The
  per-element stagger/rise was replaced by one in-place crossfade on the screen
  root (`--animate-arrive` / `@keyframes arrive`, pure opacity 0.5→1, no transform,
  floored so the swap never dips to dark). The `.stagger-children` CSS block and
  its eight `nth-child` delay rules were deleted (obsolete). `animate-rise` remains
  only where motion communicates a real event (status reveal, commit recognition,
  auth form). The screen now settles into focus; it no longer re-enters.
- Phase 35 (Commit publish bug + Avatar reveal) is **built**. Bug: the commit flow
  (`CommitFlowClient`) renders steps with `{step === N && ...}`, so step 0's `title`
  input and step 1's `durationMinutes` input were unmounted by the time the submit
  button (only on step 2) fired — native FormData captured neither, so every publish
  failed the server `title.min(1)` Zod check and silently dropped duration. Root
  cause was architectural: those two values lived in step-local native inputs while
  the genuinely cross-step fields already used controlled-state + always-mounted
  hidden inputs. Fix made the pattern uniform: `title` and `durationMinutes` are now
  controlled state mirrored to hidden inputs outside the step conditionals, with the
  visible inputs no longer carrying `name` (single serialization source). Regression
  locked by `CommitFlowClient.test.tsx`. Perception: `Avatar` is now a client
  component that fades a photo in over the initials placeholder (`--duration-base`
  opacity transition, cached-image `complete` check, reduced-motion → instant) so a
  face never snaps in. `ProfileScreen`'s duplicate inline `<img>` avatar and its
  orphaned `initials()` helper were deleted in favor of `Avatar` (size-aware
  initials), making `Avatar` the single avatar implementation across Today, Circle,
  and Profile.
- Phase 36 (Commit Enter-submit guard) is **built**. On steps 0/1 the commit flow
  has exactly one single-line input and no submit button, so a mobile keyboard's
  "Go" key implicitly submitted the form — sealing the commit prematurely with
  default feeling/visibility and no note (a "nothing rushes / the interface waits"
  violation, exposed once Phase 35 made the form always validate). `CommitFlowClient`
  now handles `Enter` on the form: outside textareas and before the submit step it
  advances the flow (when valid) instead of publishing. Locked by a second
  `CommitFlowClient.test.tsx` case. Phase 36 also **rejected** building route-level
  View Transitions: experimental/library cost and reduced-motion complexity outweigh
  a benefit that is borderline-decorative under the Interaction System (stillness is
  the resting state). The remaining seams are now low-impact or high-cost; further
  perception work is product-led, not engineering-led.
- Phase 37 (Memory Selection Engine — first activation) is **built** (was design-only
  through Phase 24). `lib/memory/selectMemory.ts` is a pure, deterministic,
  explainable selector mirroring `deriveState`: given the human state and the user's
  own reflections it returns at most one memory or `null` (silence is the default).
  v1 surfaces a memory in exactly one context — the Quiet Return (`state ===
"returning"`) — because that is the only moment whose rarity is guaranteed by the
  gap itself, so it needs no surfacing ledger to prevent repetition. Gates honored:
  context (return-only), safety (never an `emotional` reflection casually),
  truth/recency (`MEMORY_MIN_AGE_DAYS = 4`), category priority (Identity ≻
  Reflection), age-appreciates within a tier. Wired through `features/today/queries.ts`
  (candidate pool is the Journey window already loaded — no new DB read) into the
  Today returning hero, which now shows the user's selected past words **in place of**
  the static identity-statement vow (one memory at a time, never added alongside).
  Falls back to the vow, then a plain line, when the engine returns silence. Tested by
  `lib/memory/selectMemory.test.ts`. **Missing dependency for the next capability:**
  the Future Memory Ledger (append-only record of what was surfaced/withheld,
  MEMORY_SELECTION_ENGINE.md Part 11). Without it, normal-Today / Profile / Commit-
  recognition surfacing cannot enforce cooldown, rarity, or patience and would become
  wallpaper — so those contexts intentionally stay silent here.
- Phase 38 (First Commit journey — made coherent end to end) is **built**. Two
  incoherences were fixed. (1) The recognition (`ShowingUpMoment`) said "una prueba
  más" ("one more proof") even for the very first commit — false. `app/commit/page.tsx`
  now reads `getProgressSummary` to pass `isFirstCommit`, and the recognition tells the
  truth: "tu primera prueba" / eyebrow "Tu primera evidencia" on the first, "una prueba
  más" / "Quedó registrado" after. The visual treatment is identical either way —
  effort is met with proportion, not escalation; only the words change. (2) The commit
  flow surfaced a raw `lastReflection` memory on step 0 (the sacred _start_), bypassing
  the Memory Selection Engine and violating its Part 4 rule that starting evidence must
  be silent. That ungoverned surfacing was **deleted** — the step-0 memory block, the
  `lastReflection` prop on `CommitFlowClient`, and the page's `getJourney`/lastReflection
  computation. The start is now silent and frictionless; memory belongs only at
  recognition (the identity-vow echo, already governed). This supersedes the Phase 20
  note above ("the Commit flow resurfaces the last reflection as memory"), which is no
  longer true. **What still prevents this journey from feeling complete:** after the
  first commit, Today derives `building` ("Sigues apareciendo"), which reads slightly
  off for someone who has shown up exactly once — a dedicated just-started nuance would
  need either a new derived state or a totalCommits===1 branch in `deriveState`, not
  added here to avoid speculative state.
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
