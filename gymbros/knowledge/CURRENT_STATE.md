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
- Phase 39 (Quiet Return restored — progress is lifetime) is **built**. Root-cause bug:
  `get_progress_summary` defaulted to a 30-day window, but `deriveState` and
  `isFirstCommit` read its `totalCommits`/`lastCommitAt` as **lifetime** signals — so a
  user returning after a gap > 30 days derived `beginning` instead of `returning`,
  breaking the Quiet Return (and re-triggering "tu primera prueba"). Migration
  `20260625_0001_progress_summary_lifetime.sql` redefines the function all-time by
  default (`p_from '-infinity'`, `p_to 'infinity'`; same signature, no type regen; range
  params kept for scoped callers). Also hardened the single-row RPC unwrap: new
  `unwrapSingle` in `lib/dal/result.ts` (used by `getProgressSummary` + `getCommitDetail`)
  throws `NotFoundError` on an empty set instead of letting a mapper crash on
  `undefined` → `error.tsx`. Tests: `lib/dal/result.test.ts`, `supabase/migrations.test.ts`
  lock the all-time default. `unwrapData[0]` pattern removed from the RPC layer.
- Phase 40 (Today becomes state-shaped) is **built**. Previously the State Engine
  drove only the Today **hero words** while the blocks below (circle, last-evidence,
  supports, notifications) rendered in a fixed order for every state. Now the
  derived state shapes the **whole** screen per `STATE_SYSTEM.md` Part 4
  ("Appears / Silent on") and Part 5 priority, via a single declarative
  `SCREEN_POLICY` record in `TodayScreen.tsx` (no data/DAL/schema change — pure
  client composition of already-derived state). Per state: **Protected** strips to
  the hero alone — no CTA (silent on prompts), no circle, no evidence, no
  notifications (near-silence/reverence); **Resting** shows the hero + a quiet
  secondary "Cuando quieras, aparece" open-door CTA, everything else silent;
  **Supported** lifts the human word (`SupportsCard`, extracted for reuse) to the
  **top**, above notifications/circle, and hides the last-evidence card ("undiluted,"
  silent on other feedback); **Returning** keeps the foundation (last evidence) but
  silences the circle noise so nothing distracts from the sacred arrival;
  **Beginning** is one invitation (hero + CTA), silent on all metrics/memory;
  **Building** is the full steady screen (unchanged composition). The CTA is now
  state-aware (primary / quiet-secondary / none). This is the first phase of the
  "make dormant engines visible" mandate: the State Engine now actively reorders and
  reveals/hides the home screen, not just its sentence.
- Phase 41 (Process, not performance — cadence) is **built**. The product could
  remember evidence and derive state but could not express that a *practice
  evolves*. The audit found the signal already existed and was being thrown away:
  `ProgressSummary` computes `activeDays` and `firstCommitAt`, and the Archive
  query loaded the whole `progress` summary then never rendered it (a dead read).
  `lib/process/describeCadence.ts` (pure, deterministic, explainable, silence-by-
  default — same shape as `deriveState`/`selectMemory`) turns that evidence into
  **one sentence about rhythm, never a number**: e.g. "Has estado apareciendo unas
  tres veces por semana." Rhythm is counted in *active days* (not total commits, so
  a busy single day never inflates it) over the span since `firstCommitAt`, bucketed
  into soft phrases. It returns `null` (silence) until honest: fewer than
  `CADENCE_MIN_COMMITS` (3) or a span under `CADENCE_MIN_DAYS` (14). The sparse
  bucket is worded without punishment ("a tu propio ritmo"). It is rendered as a
  single quiet `text-secondary-text` line at the head of the Archive — context, not
  a headline, no card, no metric chrome — replacing the dead `progress` return in
  `features/archive/queries.ts` with a `cadence: string | null`. This deliberately
  does **not** add statistics, streaks, goals, achievements, records, or graphs
  (all rejected by brief and by Phase 23's prior metric-stripping). Tested by
  `lib/process/describeCadence.test.ts`. The **social** direction ("appear together
  tomorrow" / mutual presence) was audited and **deferred**: it needs new schema, a
  Server Action, and two-party state — complexity beyond "the smallest progression
  layer" — and is recommended as a separate future phase, not built here.
- Phase 42 (Shared presence — appearing together) is **built**. Two circle members
  can quietly commit to appear together without challenges, streaks, competition,
  schedules, or accountability-by-guilt. The audit's decisive finding: the MVP table
  set is **frozen and guarded** (`migrations.test.ts` asserts the exact created-table
  list and that no new table appears), so shared presence **reuses the notifications
  carrier instead of a new table** — migration `20260625_0002_shared_presence.sql`
  only extends the `notifications_type_check` constraint with a `shared_presence`
  type (no `create table`). A proposal is one `shared_presence` notification
  (`CircleService.proposeSharedPresence`, reusing the existing membership + profile +
  notification deps — no new DAL wiring); the partner accepts with the lightest act,
  acknowledging it (the existing `markNotificationRead`, `read_at` = accepted).
  Whether both actually showed up is **derived**, not tracked: `lib/presence/
  deriveSharedPresence.ts` (pure, deterministic, explainable, silence-by-default —
  same shape as `deriveState`/`selectMemory`/`describeCadence`) reads the proposal
  notifications + the user's own `lastCommitAt` + partners' `lastCommitRecordedAt`
  (already in circle presence — no new read) and resolves each pact to
  `waiting`/`almost`/`together`, counting only commits left *after* the pact began.
  A pact lives in a 36h window then simply expires — never failed, never mourned.
  Surfaces: a propose button on each active member in `CircleScreen`
  (`ProposePresenceForm`), and a calm `SharedPresencePanel` on Today (pending invite
  + accept, then the derived status line — "Los dos aparecieron."), gated by the same
  Phase 40 state policy so it never appears in the near-silent states (Protected,
  Resting). Shared-presence notifications are filtered out of the generic
  `NotificationsPanel` so they render in exactly one place. Tested by
  `lib/presence/deriveSharedPresence.test.ts`. **Remaining highest-leverage seam:**
  the proposer has no live tracker of the pact (RLS lets only the recipient read a
  notification, and a reciprocal "accepted" notification was deliberately not added —
  a proposer-side waiting tracker risks the "I can't disappoint them" pressure the
  phase forbids). Duplicate proposals also can't be prevented from the proposer's
  side under RLS; the form's optimistic confirmation mitigates re-tapping. Adding a
  reciprocal acceptance notification (with a distinct type) is the clean way to give
  both sides symmetric, RLS-safe visibility if that pressure trade-off is accepted.
- Phase 43 (Product polish — Circle) is **done**. The Apple-review audit found the
  Circle screen was the one screen that read as engineered, not designed: it stacked
  two parallel sections — "Miembros" and "Presencia" — that rendered the **same
  people twice** (same avatars + names), once as a member row and once as a presence
  row. That duplicated hierarchy is now **merged into one row per person**:
  `CircleScreen` folds each member's last evidence inline (`presenceByMember` map,
  keyed by `circleUserId`) and the standalone "Presencia" section is **deleted**. The
  label warmed from "Miembros" to "Tu círculo". Net: one fewer labeled section, no
  duplicate person list, less scrolling — the screen stops looking like a CRUD admin
  panel. No new code, ~30 lines removed. **Next highest-leverage refinement:** the
  Profile screen's final card stacks logout + delete-account in a single quiet box;
  separating destructive deletion from the routine logout is the next small polish.
- Phase 44 (Design system refinement) is **done**. The audit found the loudest
  "built at different times" artifact: the same passive recessed inner-block atom (a
  small inset block of secondary text) was hand-coded **three different ways** across
  three files — `SupportsCard` item (`border border-white/8 bg-white/3`),
  `NotificationCard` read state (`border border-white/6 bg-white/3`), and
  `DomainCommitCard` reflection (`bg-white/[0.035]`, borderless). Three border
  opacities, two background spellings (one an arbitrary bracket value). Unified to one
  recipe — `rounded-md bg-white/4 p-4` (borderless fill, scale value, lifts above the
  `surface-quiet` parent). Interactive controls (`Field`, `FeelingTile`) keep their
  stroke deliberately — a border reads as "tappable/editable"; only passive blocks
  lost theirs. Net: three recipes → one family, decorative hairlines removed, no
  redesign. **Next refinement:** `AppCard` `hero` and `primary` levels are nearly
  identical (both `premium-surface` + `border-white/8` + `backdrop-blur-xl`, differing
  only in radius/padding/shadow by one step); collapsing toward fewer card altitudes
  is the next vocabulary reduction.
- Phase 45 (Screen hierarchy — one surface, not a stack) is **done**. The audit asked
  per screen "one continuous surface or a stack of cards?" **Profile** was the
  offender: three stacked elevations where containers did typography's work — the hero
  mirror (a legitimate card), plus a `quiet` card whose only job was to hold an
  "Editar perfil" label + the edit form, plus a third `quiet` card boxing logout +
  delete. Neither lower card was an *item*; they were settings groupings boxed for no
  reason. (Circle's cards survive — they're genuine lists of people/invitations/
  supports; Today/Commit are single-hero; Archive is a feed.) Both `quiet` cards
  removed: `ProfileEditForm` now reads directly on the page surface (its own first
  label, "En quién te estás convirtiendo", is the hierarchy — the redundant
  card-label is gone), and account actions are set apart by a **single hairline
  divider** (`border-t border-white/8 pt-6`) instead of a container. The form's
  orphaned `mt-4` (which spaced it under the deleted label) was dropped so page rhythm
  governs. Net: three elevations → one, two containers deleted, Profile now reads as
  one calm page. **Next refinement:** Circle's hero card packs three concerns (privacy
  badge + invite form + support form) into one surface — splitting reading from acting
  there is the next hierarchy pass.
- Phase 46 (Commit flow — no silent loss of the user's words) is **done**. Root cause:
  `CommitFlowClient` kept every cross-step field in controlled state mirrored to an
  always-mounted hidden input **except** the two step-2 textareas (`note`,
  `reflectionContent`), which were uncontrolled native inputs rationalized as "local to
  the submit step." But the submit step has a "Volver" button — tapping it unmounted
  step 2 and **silently discarded the user's written note and future-note**; returning
  and publishing saved them empty. Same root cause as the already-fixed step-0 title
  loss, never extended to step 2. Fix: `note` + `reflectionContent` now live in
  controlled state mirrored to hidden inputs like every other field — one uniform field
  model, no field survives differently from another. Regression test added
  (`CommitFlowClient.test.tsx`): type both fields on the submit step, go back, return,
  assert the values persist. (Separately confirmed the 30-day-window bug was unique to
  `get_progress_summary` — `get_journey_timeline` is count-limited, `get_shared_history`
  is membership-scoped, `get_circle_presence`'s last-commit is all-time; no other RPC
  carries that latent window.) **Next highest-leverage opportunity:** the commit step-2
  "Nota personal" (stored on the commit) vs "Nota para tu yo del futuro" (a typed
  reflection) are easy to confuse, and a `reflectionType` chosen without reflection text
  is silently dropped — clarifying that relationship is the next UX pass.
- Phase 47 (Commit flow — one note, writing before classification) is **done**. Human-
  experience audit of the Commit journey (no schema/entity/form-structure lens — only how
  it feels to a first-time person). Decisive finding: step 2 showed **two empty textareas**
  — "Nota personal" (→ `commits.note`) and "Nota para tu yo del futuro" (→ a `reflection`)
  — which is the **data model leaking two homes into one human act**. A person journaling
  writes one thing; two boxes force a "which one? what's the difference?" decision that is
  the machine's split, not theirs. Merged to **one note**. The written words now feed the
  **reflection** (`reflectionContent`) — the canonical home the State Engine and Memory
  Selection Engine actually read — so no engine weakens (every branch, threshold, and test
  in `deriveState`/`selectMemory`/the reflection pipeline is untouched; `emotional`→
  Protected and `identity`-priority remain live). `commits.note` is simply no longer
  written from the flow (column kept; legacy notes still render). The optional reflection-
  **type** picker (Identidad/Proceso/Emoción/Técnica) now appears **only after** the user
  has written words — "Writing comes before classification / reflection before metadata"
  made literal — which also **structurally eliminates** the Phase 46 next-opportunity bug
  (a type can no longer be chosen and silently dropped with no note). `DomainCommitCard`
  was de-duplicated: it rendered `commit.note` **and** the first reflection as two blocks;
  it now shows the user's words once (prefer legacy `note`, else the reflection), with a
  secondary block only for a legacy commit whose reflection genuinely differs. The
  second textarea, its `note` controlled state, and its hidden input were deleted (delete
  UI before adding UI); the Server Action is unchanged (`note` resolves to `null`). Tests
  updated: single-note back-navigation persistence + a new "type appears only after words"
  case (`CommitFlowClient.test.tsx`). Visibility (Privado/Círculo/Público) and the step-0
  training-type pills were audited and **kept** — they are genuine human choices, not
  machine metadata. **Next opportunity:** Protected is now only reachable when a reflection
  carries `emotional`, which a human self-tag is a weak source for; deriving the "heavy day"
  signal from real evidence (never inferred emotion — STATE_SYSTEM hard boundary) rather
  than a pill is the honest long-term path.
- Phase 48 (Onboarding unblocked — remote DB migration drift + error-leak) is **done**.
  Reported via screenshot: onboarding showed "Database operation failed" and never
  completed. Diagnosed from Supabase logs, not guessed — the postgres service log had
  **zero error rows** (ruling out a constraint crash logged at DB level), but the api
  (PostgREST) log showed the onboarding submit as `PATCH /rest/v1/profiles … | 400`
  twice. Root cause: the **remote DB was three migrations behind the repo** (applied
  through `20260623_0001_social_core`; missing `20260624_0001_identity_statement`,
  `20260625_0001_progress_summary_lifetime`, `20260625_0002_shared_presence`). The
  onboarding PATCH writes `identity_statement`, a column that **did not exist** on the
  remote `profiles` table → PostgREST 400 → mapped to the generic `DatabaseError`. Fix:
  applied all three pending (idempotent, additive) migrations to the remote project; the
  DB now matches the repo (16/16). Secondary, in-code: `friendlyAuthError`
  (`lib/auth/session.ts`) returned the raw `AppError.message` for any non-conflict code,
  leaking machine English ("Database operation failed", "Not authorized for this
  operation") straight to users — a Voice violation across its 10 callers. Now every code
  maps to a calm human Spanish line and the underlying cause is `console.error`-logged
  server-side, so a swallowed database/infrastructure failure stays diagnosable instead of
  invisible. **Process note:** the recurring trap is migrations committed to the repo but
  not pushed to the hosted project — run `supabase db push` (or apply via MCP) as part of
  shipping any phase that adds a migration. **Known minor:** the onboarding Username field
  still triggers the browser-native "Completa este campo" tooltip (system chrome, not the
  product Voice) — a small future polish, not a blocker.
- Phase 49 (Commit becomes Evidence — documenting an active life) is **done**. Audit
  question: "What deserves to become evidence?" The product treated evidence as
  synonymous with a gym session. Decisive finding: **the data model is already a general
  evidence model** — `commits.type` is free text (`z.string().max(50)`, DB check `len ≤
  50`) with **zero behavioral coupling** anywhere (grep confirms nothing branches on a
  type value; it is only a fallback display title), and the product already speaks
  "evidencia" ("Dejar evidencia", "Convierte lo que hiciste en evidencia…"). So the only
  thing gym-locking the product was the **UI taxonomy and one nav label**, not the
  architecture. **Chosen direction:** keep the `commits` model (no new table, no
  migration, no schema change — the frozen MVP contract stands) and broaden the surface.
  The activity kinds went from gym-shaped (`training/mobility/cardio/recovery/nutrition/
  mind`) to active-life-shaped (`Entrenamiento/Correr/Bici/Montaña/Caminar/Movilidad/
  Mente`); `trainingOptions`/`TrainingType`/`trainingType` were renamed
  `activityOptions`/`ActivityKind`/`activityKind`; the gym-only nav center label
  `aria-label="Registrar sesión"` became `"Dejar evidencia"`; the step-0 placeholder
  de-gymmed. **Rejected:** renaming the `commits` table to `evidence` (fights the
  guarded table contract for zero user-visible gain — the table name is implementation),
  and a new `activity_kind` enum column (would *narrow* a field that is intentionally
  open). A run, a climb, a recovery walk are now first-class evidence. No schema/DAL/
  Server-Action change; old commits with legacy types still render (free text). **Explore
  tab — audited, deliberately NOT built.** Moving Archive into Profile would free a nav
  slot for an Explore destination (knowledge / stories / public evidence / places to
  train), but there is **no content model** for any of it, and a hollow discovery surface
  fails the brief's own gate ("Does this deepen someone's practice? If not, do not build
  it") and risks the feed/engagement shape the product refuses. Recommended as its own
  phase, gated on first defining what "curated, not addictive" content actually is. The
  public-evidence half also needs RLS for cross-user public reads + a non-infinite
  surface — real product-risk design, not a small change.
- Phase 50 (Profile becomes identity; Explore proven-not-ready) is **done**. Audit
  question: "If I didn't train today, why would I still open Gym Circle?" — the answer was
  weak. The brief challenged Phase 49's claim that Explore needs a new content model ("Can
  Explore emerge from existing evidence? Reuse before inventing"). **Investigated the RLS
  substrate and proved the real boundary:** `commits_select_public_authenticated`
  (`20260622_0009_rls.sql`) **already lets any authenticated user read every public
  commit** — public *evidence* is fully supported. But profiles have only own/circle
  select policies (**no public-profile policy**), so a public commit **cannot be
  attributed to its author** — "people" is unsupported; reflections are `private|circle`
  only (**never public by design**), so "reflections" discovery is impossible; and there
  is **no location/geo data**, so "places" cannot exist. Therefore *public evidence alone
  is not enough* — Explore as specified (evidence + people + places + reflections) is
  **not buildable from existing architecture** and was **deliberately not built** (proof
  above; near-zero public content compounds it, and a stranger-evidence wall is the feed
  shape the product refuses). The smallest real prerequisite is a `profiles_select_public`
  policy **plus** identity-rich profiles worth discovering — which is the build this phase
  did instead. **Built: Profile as identity, not settings.** The profile was a mirror +
  edit form; it answered "what's my vow / edit me", not "who is this person?". It now leads
  with identity and shows **the life the person is building** — a recent glimpse of their
  own evidence (`getJourney` limit 5) and its rhythm (`describeCadence`), rendered with the
  existing `DomainCommitCard`; the edit form and account actions **recede beneath** a
  hairline so settings are the tail, not the body. No statistics (the brief: prefer story/
  evidence/memory/place over numbers — and Phase 23 already stripped tallies). Pure reuse:
  `getProfileViewModel` now loads the same journey+progress the Archive reads (no new
  query, entity, table, RLS, or Server Action); memory was intentionally **not** surfaced
  here because cross-context memory surfacing is gated on the unbuilt Future Memory Ledger
  (Phase 37). The app now begins to feel **inhabited** — your own life held in the surface
  — without becoming busier or addictive. **Next opportunity:** Explore is now one policy
  away conceptually — add `profiles_select_public` (read only public-`visibility_preference`
  profiles), then build a single finite, unranked surface of recent public evidence
  attributed to its author. Only worth it once enough people share publicly; until then it
  is a calm empty room. **Minor:** `ProfileSkeleton` (`RouteSkeleton.tsx`) no longer mirrors
  the new evidence section — a small Phase 33 shell-match follow-up, cosmetic only.
- Phase 51 (Evidence expresses its movement; Explore re-proven not-ready) is **done**.
  Product (not component) audit of "what meaningful actions exist besides leaving
  evidence?" (support a member, invite/accept circle, propose/accept shared presence, set
  identity, choose visibility, classify a reflection) and "which deepens practice most
  while respecting every principle and reusing what exists?". Winner: **none of the
  relational actions — the evidence itself was under-expressed.** Concrete finding:
  `DomainCommitCard` computed `title = commit.title || commit.type`, so the Phase 49
  movement vocabulary (run/ride/hike/walk/…) was **invisible whenever a title existed** —
  a run, a hike and a climb all rendered identically. The texture of an active life was
  recorded and thrown away, which is *why* the record felt flat between pieces. **Built:
  evidence now expresses its movement**, the smallest truthful change that adds life to
  every surface at once (Today, Archive, Profile, Circle) with zero new architecture. One
  shared movement vocabulary was extracted to `features/shared/activityKinds.ts`
  (`activityKinds` + `ActivityKind` + `activityKindLabel`): the commit flow's picker and
  the card now read the **same list** (CommitFlowClient's local `activityOptions` was
  deleted). The card shows the discipline quietly — riding the meta line next to the date
  when a title was written (`Correr · 12 jun`), or becoming the title when none was — and
  `activityKindLabel` returns **silence over a raw machine key** (unknown free-text → null,
  never "crossfit" shown literally) while still labelling legacy kinds (cardio/recovery/
  nutrition) so no past evidence is orphaned. The `"Commit"` fallback title became
  `"Evidencia"` (Phase 49 language). Locked by `features/shared/activityKinds.test.ts`
  (current vocab, legacy mapping, silence). **Explore — re-audited against the broader
  candidate list (movement disciplines, people, shared presence, circles, memories,
  identity, saved/collections/highlights) and re-proven not-ready with the same hard
  architectural evidence as Phase 50:** the only cross-user-readable substrate is public
  commits (`commits_select_public_authenticated`); profiles have **no public select
  policy** (no attribution → no "people"), reflections are `private|circle` only (no public
  memories), and saved/collections/highlights/routines/places are **entities that do not
  exist** — building any would be inventing, which the brief forbade. Every honest
  discovery primitive either needs a new RLS policy or a new entity, so no empty shell was
  built. **Identity re-audit:** Phase 50's evidence-on-profile plus this movement
  expression now make the profile read as a portrait (each piece of the life shows its
  discipline), so no further profile build was needed. **UX:** the movement label is the
  evidence-presentation polish the brief asked for — information, not decoration; no icons
  added (none existed and a 7-glyph set would have been decorative). **Next opportunity:**
  the single highest-leverage unlock for any discovery remains one migration —
  `profiles_select_public` (read public-`visibility_preference` profiles) — after which the
  smallest truthful Explore is recent public evidence attributed to its author, finite and
  unranked; still worth building only once people actually share publicly.
- Phase 52 (The chapter — a life in movement, not only workouts) is **done**. Audit
  question: "What part of an active life has nowhere to exist?" Mapping the brief's
  life-list (preparing for a race, finishing one, recovering from injury, returning
  after months, documenting a trip, a season of life) against the model showed they
  all share one shape — a **span/arc**, not a point — and the product had **no home
  for the present arc**. It held the permanent *who* (`profiles.identity_statement`,
  Phase 22) and the discrete *points* (`commits`), but nothing for "what am I living
  through right now?". `cadence` (Phase 41) is a derived sentence about the past, not
  a named present; the dormant `bio` column is permanent self-description, semantically
  wrong (and retired in Phase 23). So the gap was real and **not buildable from
  existing fields** — a minimal extension was justified. **Built: the chapter** — one
  nullable `profiles.chapter` column (migration `20260629_0001_chapter.sql`, 1–140,
  additive/idempotent), mirroring the proven identity_statement template exactly across
  generated types, DAL (type/mapper/`updateProfileSchema`+`createProfileSchema`/
  repository insert+update), `lib/auth/schemas.ts` (so `updateProfileFormSchema`
  inherits it), and the profile update action. The chapter is **present tense and
  changeable** (distinct from the permanent vow) and is **the user's own words**
  (principle 13) — null is silence. **UX:** the Profile now reads as a portrait in
  three movements — *who you are becoming* (identity hero) → *what you are living now*
  (the chapter, an accent-labelled "Ahora" block, shown only when written) → *the
  proof* (evidence + cadence). The Today `building` hero — the everyday home screen —
  now reflects the named season back ("{chapter}" / "en eso estás ahora.") instead of
  generic filler, and falls back to the plain recognition when there is no chapter.
  Onboarding was **left untouched** (the sacred act stays light, principle 12); the
  chapter is set from the Profile edit form, where its invitation lives. No new table
  (the frozen MVP contract stands — `migrations.test.ts` extended with the ordered
  filename + an additive-nullable assertion), no new query/entity/RLS, no Server Action
  beyond the existing profile update. **Rejected alternatives:** Explore/finite discovery
  (re-proven not-ready, same hard evidence as Phases 50–51 — no public-profile RLS, no
  public reflections, no places); places/trails (no geo substrate — would be inventing);
  a heavy chapter-that-*groups*-evidence (a join FK + aggregation surfaces is speculative
  architecture for value the single living line already delivers); a milestone flag
  (edges toward celebrating arrival, which the Bible forbids); reusing the dormant `bio`
  column (wrong semantics, resurrects a retired field). **Code removed:** none — the
  change is purely additive by design (remove-before-adding found no redundancy to
  retire). **Process note (Phase 48):** the new migration must be pushed to the hosted
  Supabase project (`supabase db push` / MCP) before onboarding/profile writes succeed
  remotely; until then `profiles.chapter` does not exist on the remote table. **Next
  opportunity:** the chapter is currently a standalone line; the natural deepening is to
  let a piece of evidence quietly belong to the chapter it was made within (so a season
  can later be *re-read* as the arc of evidence it held) — but only once chapters have
  earned their weight in real use, and only if it can be done without a grouping table
  the frozen contract forbids.
- Phase 53 (Documentation — evidence becomes an openable, living document) is **done**.
  Audit question: "What would make someone open Gym Circle even if they are not leaving
  evidence today?" Answer (product value, not notifications): **to return to and add to
  a documented experience.** Decisive finding: evidence was **write-only** — you could
  leave it and glimpse it in a feed, but there was **no route to open a single piece**.
  `get_commit_detail` (RPC + `CommitService.getCommitDetail` + `CommitDetail` type, all
  already built) had **zero callers** outside tests — a fully-built dead read. The
  "Documentation" hypothesis was tested against the existing model and **needed no new
  entity**: every field a document needs already exists — `commits` (title, type/movement,
  recordedAt, duration, intensity, visibility, the dormant `evidence` jsonb for future
  media) plus its 1:N `reflections` (the written account). Proof a new entity was
  unnecessary: a "document" is just a commit rendered in full with its reflections, and
  reflections are already 1:N + owner-insertable (`reflections_insert_own` RLS), so the
  account can **grow over time**. **Built:** (1) `app/evidence/[id]/page.tsx` + a new
  `features/evidence/` (`queries.getDocumentViewModel`, `DocumentScreen`,
  `AddReflectionForm`, `actions/addReflection`) — the route activates the dormant
  `get_commit_detail`; RLS (security-invoker) is the authorization boundary, so a commit
  the viewer can't see returns empty → `NotFoundError` → `notFound()` (404, never a leak).
  (2) The document renders the experience: facts (movement/intensity/duration/visibility
  chips, author shown only to non-owners), then the account (legacy `note` + every
  reflection in full, oldest→newest), then — **the capability that makes it documentation,
  not a detail view** — an owner-only form to **add a reflection after the fact** (a lesson
  from a hike, what a race felt like in hindsight), via `CommitService.createReflection`
  (private/`process`). This is the concrete non-training-day reason to open the app.
  (3) `DomainCommitCard` is now a quiet `Link` to `/evidence/{id}` (calm hover/focus
  affordance, `aria-label`, no chevron), so **every evidence card across Today, Archive,
  and Profile is openable** — the dead-end feed becomes navigable. **Explore — re-audited
  and again deferred:** Documentation is exactly the finite, real content Explore would
  need, but the wall proven in Phases 50–52 stands — `get_commit_detail` is security-invoker,
  so a public stranger's commit would render with an **empty author** (profiles still have
  no public-select policy → no attribution). Explore stays one migration
  (`profiles_select_public`) away; no empty shell built. **Profile — strengthened more than
  Explore would:** identity (who, Phase 50) + chapter (now, Phase 52) + evidence cards that
  **now open into full documents** make the three connect — a portrait whose pieces are
  enterable. No nav change forced. **Architecture impact:** no new table, no new migration,
  no new entity, no schema change — purely activating a built-but-unused RPC and adding one
  route + one Server Action (`createReflection`, already in the service). **Code removed:**
  none — additive by design; the change retires a *dead read* by giving it a surface rather
  than deleting code. Tests stay 99 (no new test added — the new surfaces are server
  components + a thin action over already-tested service/RPC paths; `selectMemory`/
  `deriveState` consume the later-added reflections unchanged). **Next opportunity:** the
  account can now grow but individual entries can't be edited/removed from the document
  (`editReflection`/`removeReflection` exist in the service, no surface); and the dormant
  `commits.evidence` jsonb is the natural home for photos once Storage lands — either is a
  clean follow-up, neither foundational.
- Phase 54 (Explore — the world, as a finite library) is **done**. Audit question:
  "Where does the world exist?" Mapping everything outside the user: people →
  *blocked only by a product decision* (no public-profile policy); public documentation
  → *partially supported* (public commits readable since `commits_select_public_authenticated`,
  documents openable since Phase 53, but **no author attribution**); places/routes/
  mountains/races/clubs/events/knowledge/techniques/books/podcasts/equipment/recovery →
  *impossible without inventing entities* (no geo, no events, no content model) and largely
  feed/editorial shapes the product refuses; challenges → rejected by Principles. So the
  **only** part of "the world" the architecture can express without new entities is **other
  people's public documentation, attributed** — and the sole blocker was the single missing
  RLS policy proven necessary across Phases 50–53. **Built that and nothing speculative:**
  migration `20260629_0002_profiles_select_public.sql` adds `profiles_select_public` (read a
  profile only when its owner chose `visibility_preference = 'public'`, not deleted) — a
  policy, no table, no column. Two opt-ins are now required for anything to surface (public
  commit **and** public profile). DAL: `CommitRepository.listRecentPublicCommits(limit)` +
  `CommitService.listRecentPublicCommits` — one bounded cross-user read of public commits
  (RLS-scoped), no cursor, no infinite scroll. `features/explore/queries.ts` joins those to
  their now-readable authors via the existing `profiles.listProfilesByIds`, **omitting any
  document whose author isn't publicly discoverable** (attribution is the point; no faceless
  cards). **Explore is a calm library, not a feed:** `app/explore/page.tsx` +
  `ExploreScreen`/`PublicDocumentCard` show a finite (≤30), unranked set of public documents
  — author (face + name) + movement + title + date — each a `Link` into the existing
  `/evidence/[id]` document (now rendered with its author populated). No counts, likes,
  follows, ranking, or pagination. Empty state is an invitation, not a void. **Navigation
  redesigned (proven, not forced):** the four destinations around the center Commit are now
  *now (Hoy) · the world (Explorar) · yours (Círculo) · you (Perfil)*; **Archive left the
  top-level nav** because it is a deeper view of *your own* evidence, which already lives
  under Profile (Phase 50) — `/archive` stays and is reached by a "Ver todo el archivo" link
  in the Profile evidence section. New `compass` glyph added to the one icon set. **Why this
  IA:** Today/Circle/Profile are you-and-yours; the missing top-level concept was the world,
  and Explore is a genuine destination (a library), whereas Archive is a sub-view of self.
  **Architecture impact:** no new table, no new entity, no schema/column change — one RLS
  policy + one bounded read + one route. **Rejected directions:** places/routes/events/clubs/
  knowledge/books/podcasts/equipment (all require inventing entities or editorial content —
  speculative, and several are feed/marketplace shapes the product refuses); a "people"
  directory with follow/discover (no follow primitive exists and it drifts toward a social
  graph — people appear *through* their documentation instead, and can still be invited to a
  circle by username); folding Archive *into* Profile as an inline full history (heavier,
  unnecessary — a link suffices). **Code removed:** none — additive (one policy, one read,
  one route) plus a nav swap; the dormant public-read substrate finally has a surface.
  Tests 100 (a migration-contract assertion added). **Process note (Phases 48/52):** the two
  new migrations (`20260629_0001_chapter.sql`, `20260629_0002_profiles_select_public.sql`)
  must be pushed to the hosted Supabase project before chapter writes and Explore attribution
  work remotely. **Next opportunity:** Explore currently lists recent public documents
  globally; the next deepening (only once there is real public volume) is gentle, non-feed
  organization — by movement/discipline as library "shelves", or a single public profile
  view (`/u/[username]`) so a person discovered through one document can be seen whole — both
  reuse the now-public profile substrate and need no new entity.
- Phase 55 (Explore lives its restraint — stops feeling like software) is **done**.
  Founder-eyes experience audit (emotion/rhythm/silence, not code) of every screen:
  Today, Commit, Document, Circle, Profile all read as **alive**; **Explore was the
  one surface that still read as software** — and the brief's named target. Two
  concrete, canon-backed flaws (not taste): (1) it **advertised its own restraint**
  (subtitle "Finita, sin ranking, sin prisa") — the product hanging a sign saying it
  is calm, the exact pattern Phase 23 removed ("the product no longer advertises its
  own philosophy — it lives it"); a calm library is simply calm. (2) Its empty state
  **reported a void** ("Todavía está en silencio"), violating Voice (empty states are
  invitations that *begin a story*, never report absence) — and since public content
  is near-zero, the empty state is the screen **almost every user actually sees**.
  **Built (purely UX, no schema/migration/entity/DAL/Server-Action change):** removed
  the self-advertising subtitle from `app/explore/page.tsx` (the page is now eyebrow +
  title + the room itself — space is breath); rewrote the `ExploreScreen` empty state
  from a report of silence into a warm invitation ("Aquí vivirá la práctica de otros.
  … Puedes ser quien lo empiece."). **Deliberately left alone:** the uniform document
  cards — documents are equals, and elevating one would imply ranking, which the
  product refuses; the feed-vs-library difference here is **framing**, not hierarchy.
  **Rejected:** ripping Explore from the nav (thrashing — the cold-start was known and
  accepted in Phase 54); shelves-by-movement (right long-term shape but sparse/cold
  with near-zero content — Phase 54 correctly deferred it to "real public volume"); a
  redundant empty-state CTA (the center Commit button already exists — adding one is
  the "while you're here…" attention pull the Interaction System forbids). **Code
  removed:** the subtitle prop usage (one line). Tests stay 100 (copy-only + a server
  page header change; no logic path touched). **Next opportunity:** once public volume
  is real, the populated state earns gentle non-feed organization (movement "shelves")
  and/or a public profile view (`/u/[username]`) — both already noted in Phase 54,
  both reuse the now-public profile substrate, neither needs a new entity.
- Phase 56 (The mirror remembers — Selection Policy v2: the Profile origin) is
  **done**. Product-architect audit of "why would someone open Gym Circle tomorrow if
  they are NOT leaving evidence?" The honest answer was weak, and the structural reason
  was canonical: `selectMemory` has been hard-locked to the Quiet Return since Phase 37
  because everywhere else needs the **Future Memory Ledger** (MEMORY_SELECTION_ENGINE.md
  Part 11) to keep a *push* rare. **Decisive governance finding (this is why the obvious
  "big" build was rejected):** answering the brief's question with an everyday Today
  *push* memory — "give them a reason to open" — is the **exact engagement mechanism the
  Memory Governance constitution forbids** (Immutable 6 "memory never exists to increase
  opens"; Decision-Framework Q4 "if its mechanism is 'the user opens the app more', it
  fails"; Bible Part 10 "it wants their continuity, not their attention"). So the truthful
  answer flips to a **pull** surface, where the user already came to themselves — and a
  pull surface needs **no ledger** (the ledger gates pushes, not pulls), which means **no
  new table, no migration, no write-on-read, no frozen-contract change.** This also
  **corrects Phase 50**, which deferred Profile memory citing the ledger — an over-broad
  application of a push-only gate. **Built (Selection Policy v1 → v2):** `selectMemory`
  gained a `context: "today" | "profile"` discriminator (default "today", so the existing
  Quiet-Return path and its tests are untouched). The new `profile` branch returns one of
  the user's **oldest** words — their origin — through the same deterministic, explainable,
  silence-by-default gates as the return (safety: never an `emotional` reflection; truth:
  age ≥ `MEMORY_PROFILE_MIN_AGE_DAYS = 30`, matching the engine's own 30-day timeline)
  **plus** a new gate: never echo the `identity_statement` vow already shown on the hero
  (Rule 7, one memory at a time). The candidate pool is a new bounded read,
  `ReflectionRepository.listOldestReflectionsForProfile` (ascending, RLS-scoped by the
  existing `reflections_select_own`, ≤50) exposed via a small new `ReflectionService`
  (`services.reflections.listOldestForProfile`) wired in the factory — reflections were
  previously only reachable commit-scoped through `CommitService`. `getProfileViewModel`
  loads the oldest reflections and runs the engine; `ProfileScreen` renders the origin as
  a quiet section between the hero vow and the chapter — *where you started → what you are
  living now → the proof* — the user's own words leading, our framing reduced to one line
  of distance ("Lo escribiste hace 3 meses. Sigues siendo esa persona."), and **silent by
  default** (most profiles return null until a reflection has aged into an origin).
  **Governance Part 8 — Selection Policy v2:** *What changed?* one pull context (Profile)
  added; selection otherwise unchanged. *Why?* it deepens identity on a surface the user
  chose, returning their own earliest voice with the distance that makes it mean something
  (truth + identity improve; calm preserved — one memory, pull, silent by default). *Which
  principle?* Bible Part 6 (first-reflection resurfacing), Principles 13/15, Selection doc
  Part 4 (Profile: "Yes — Identity, origin"); it violates none — notably not Immutable 6,
  because it is a pull, not an open-driver. **Rejected (and why):** the Future Memory
  Ledger + everyday Today push (constitution-forbidden as above — the larger build was the
  *wrong* build, not merely the harder one); a new `memory_surfacings` table (only a push
  needs it); richer profile customization / trips / races / collections / public profiles
  (each invents entities or is a feed shape, and none answers the question as truly as the
  product remembering you). **Code removed:** none — additive (one read, one service, one
  engine branch, one surface); no obsolete architecture was found to delete this phase.
  Tests 104 (+4: profile origin selection, the 30-day origin gate vs the return gate, vow
  non-echo, safety). **Next opportunity / biggest remaining limitation:** the origin pool
  is the 12 oldest reflections, so a user with a very long history still gets a *true*
  origin, but Archive (the other sanctioned pull surface, Part 4: "rare gentle header")
  still shows no memory, and turning-point / "the line that traveled" (early-vs-recent
  contrast) memories remain unbuilt — both are pull-surface, ledger-free extensions of
  Policy v2. The everyday Today push stays correctly unbuilt unless/until it can be
  justified by truth rather than opens, which by the constitution it cannot.
- Phase 57 (Chapters become living containers — evidence belongs to its season) is
  **done**. Systems audit of "the smallest capability that makes Gym Circle twice as
  alive" found three systems whose promises converged on one gap: **Chapters** named
  the season you are living (Phase 52) but **held nothing** — a dead line on the
  Profile; **Evidence/Archive** was a flat, undifferentiated stream of points with no
  arcs; **Documentation** let a single document grow but kept each document an island.
  The dominating leap (it satisfies the brief's "Chapters as living containers",
  "Profile as home of the journey", and "documents richer over months" hypotheses at
  once): **make each piece of evidence belong to the season it was made within**, so a
  chapter stops being a line and becomes the living arc of evidence it held, and the
  Archive stops being a stream and becomes *a life told in seasons*. **Built:** a single
  nullable `commits.chapter` column (migration `20260629_0003_commit_chapter.sql`, ≤140
  check, additive/idempotent) — a denormalized copy of the user's own chapter words at
  the moment of the act, **not a grouping table** (the frozen MVP 6-table contract holds;
  `migrations.test.ts` extended with the ordered filename + an additive-nullable / no-new-
  table assertion). The season is **stamped automatically** at creation from the
  profile's current chapter (`publishCommit` action passes `context.profile.chapter` into
  the existing `publishCommitWithReflection` path) — ambient context, never a new question
  in the flow, so the sacred act stays light (Principle 12). Full DAL thread: generated
  types (commits Row/Insert/Update), `Commit.chapter`, `mapCommit`, `publishCommitSchema`,
  repository insert. **The Archive is reorganized** (`getArchiveViewModel` now groups the
  journey into contiguous **seasons** by chapter — joining the journey RPC, for evidence +
  reflections, to a parallel `listCommitsForProfile`, for each commit's chapter, by id —
  the journey RPC was deliberately left untouched because migrations are not executed by
  the five validations, so the season-grouping lives in fully-typechecked TypeScript
  instead of unvalidated SQL). `ArchiveScreen` now renders each season under a quiet
  accent divider in the user's own words (season-less evidence simply has no header) —
  **the flat journey list is gone** (the `journey` prop replaced by `seasons`). **What
  disappeared:** the flat-stream Archive concept — the record is now a sequence of named
  arcs, a reduction in concept (a log → a life in seasons), not an addition of chrome
  (same cards, quiet dividers, no counts/stats/feed). **Rejected:** photos on evidence
  (the dormant `commits.evidence` jsonb is ready, but needs Supabase Storage — a whole
  unbuilt subsystem — and risks the Instagram drift; deferred); collaborative/shared
  documentation (needs cross-user reflection writes against `reflections_insert_own` RLS
  and edges toward social — deferred); memory turning-points (an incremental Policy-v3
  deepening, not "twice as alive", and needs years of data). **Architecture impact:** one
  nullable column, no new entity/table/RPC/RLS change; the season timeline is *derived*
  from stamped evidence (distinct chapter runs = the seasons lived), so chapters never
  needed a table of their own. **Process note (Phases 48/52/54):** three migrations now
  await a hosted-Supabase push (`20260629_0001_chapter`, `_0002_profiles_select_public`,
  `_0003_commit_chapter`); until pushed, `commits.chapter` does not exist remotely and
  stamping/grouping no-ops to null. Tests 105 (+1 migration assertion; the new code is
  server queries + pure grouping over already-tested mappers/services). **Single biggest
  remaining limitation:** a season is only re-readable inside the Archive — a *document*
  does not yet show the season it belonged to (its connective tissue to the larger arc),
  and a past chapter has no surface of its own (e.g. a quiet `/season/[name]` or a chapter
  shown on the Profile as the arc it now contains); both are pure-surface follow-ons over
  the column shipped here (the Document one needs `chapter` added to the `get_commit_detail`
  / `get_journey_timeline` RPC return, an owner-only render).
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
- `/evidence/[id]` a single piece of evidence opened as a full document
- `/explore` a finite library of public documentation, attributed to its authors
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
