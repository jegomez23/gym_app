# Principles

Question: What must not be violated?

Last reviewed: 2026-06-23 (Phase 20 — Product Bible & Identity System)

This file is canon. `PRODUCT_BIBLE.md` explains why these principles exist;
this file is the operational list every feature must satisfy. When a proposal
conflicts with anything here, the proposal loses.

---

## Immutable Product Principles

These do not change. A feature is correct only if it satisfies all of them.

1. **We remember; we do not count.** Identity is built from evidence, not from
   numbers going up.
2. **We reinforce identity, never guilt.** The product helps a person become;
   it never makes them feel they have fallen behind.
3. **We witness; we do not judge.** Being seen by a few who care is the
   mechanism. Rating, ranking, and scoring are not.
4. **Recognition over rewards.** We name the person, never hand out points.
5. **Evidence over metrics.** We show what was built, never measure worth.
6. **Continuity over velocity.** Success is showing up again, not doing more,
   faster, or longer.
7. **Absence is held, never punished.** There is no failure state, no broken
   streak, no red mark for stopping.
8. **Return is sacred.** The person who comes back after absence is who we exist
   for. They are always met with warmth and continuity.
9. **Private over viral.** Nothing is built to spread. The product is a private
   record, not a public performance.
10. **Calm over engagement.** We do not compete for attention. A user who opens
    the app rarely and lives their identity fully is a success, not a churn risk.
11. **Fewer people, stronger bonds.** Belonging scales down. We optimize for a
    small circle that truly sees you, never for a large network.
12. **The sacred act must stay light.** Showing up should cost almost nothing —
    minimal taps, minimal decisions, minimal friction.
13. **The user's own words outrank ours.** A resurfaced reflection is more
    powerful than any copy we could write; we get out of the way.
14. **Numbers are never the headline.** If a number must appear, it serves a
    sentence about the person; it is never the message itself.
15. **Meaning over functionality.** A feature that adds capability but dilutes
    meaning is a net loss.
16. **Remove before adding.** The default answer to "should we build this?" is
    no. Restraint is the product.
17. **Silence is allowed.** Not every moment needs feedback. Sometimes the most
    respectful response is nothing at all.
18. **The interface speaks the user's language; the code keeps its own.** Domain
    precision lives in `DOMAIN.md`; emotional language lives in `VOICE.md`. (See
    "the word Commit" in `VOICE.md`.)
19. **Identity is claimed, never assigned.** We create the conditions for a
    person to recognize themselves; we never tell them who they are.
20. **Trust is the moat.** Privacy, calm, and the absence of manipulation are
    the product's deepest value. Nothing is worth breaking them.

---

## Things We Will Never Build

This blacklist is permanent. Each item is rejected because it violates the
philosophy, not because of timing or resources.

- **Leaderboards** — they convert becoming into competition and replace identity
  with rank.
- **XP, points, or levels** — they make the number the goal and the person an
  afterthought.
- **Streaks that can be broken** — they manufacture anxiety and turn continuity
  into a debt that punishes absence.
- **Public feeds** — they turn private evidence into performance and invite
  comparison.
- **Follower counts** — they measure reach, which has nothing to do with
  becoming.
- **Like systems / reaction counts** — they reduce human recognition to a
  tally. Support carries words, not counts.
- **Competition between users** — another person's process is never a yardstick
  for your own.
- **Body comparison** — it attacks the user's relationship with themselves; it
  is the opposite of identity reinforcement.
- **Daily guilt reminders** — pressure and shame are not motivation; they are
  corrosion.
- **Endless scrolling / algorithmic feeds** — they harvest attention, which we
  refuse to take.
- **Vanity metrics of any kind** — anything whose only purpose is to be admired.

If a future idea resembles anything on this list, it is rejected without debate.

**Memory and resurfacing.** When a feature returns the user's own past to them
(reflections, the identity statement, supports, origins, returns), these principles
are extended into selection ethics by `MEMORY_SELECTION_ENGINE.md`, the canonical
owner of _how memory decides what to surface and when to stay silent_. No
memory-surfacing work satisfies these principles unless it satisfies that document.

---

## The Future Filter

Before anything is built, it must pass every question. One "no" rejects it.

- Does it reinforce identity?
- Does it reduce shame?
- Does it create calm?
- Does it strengthen a real relationship?
- Does it simplify the experience?
- Does it remove more than it adds?
- Would the user's own words be better than ours here?
- Would Apple approve the restraint, Headspace the calm, Stoic the meaning, and
  Linear the clarity?

The purpose of this filter is to make good decisions inevitable and bad ones
obvious before any code is written.

---

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

- `PRODUCT_BIBLE.md` — why the product exists (highest source of truth)
- `VOICE.md` — how the product speaks
- `docs/01-truth.md`
- `docs/02-manifesto.md`
- `docs/architecture/00-project-architecture.md`
- `docs/architecture/02-development-rules.md`
- `docs/engineering/00-engineering-principles.md`
