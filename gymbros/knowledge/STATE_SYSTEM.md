# State System

Question: Where is the person right now, and how should the product behave there?

Last reviewed: 2026-06-24 (Phase 27 — State System)

This document is canon. It defines the finite set of **human states** a person can
inhabit inside Gym Circle, and how the product should behave in each. It sits in the
hierarchy below the Interaction System (how the product behaves) and above
implementation (what gets built): behavior is shaped by *where the person is*, and
implementation must begin from a human state, never from a screen.

Authority order, fixed and one-directional:

```
Product Bible → Voice → Principles → Memory Governance → Memory Selection → Interaction System → State System → Implementation
```

When a build decision conflicts with what is written here, this document wins; the
layers above it win over it. Critically, this document describes **observed states
derived from evidence, never inferred emotion** (see Part 9).

---

## Part 1 — Philosophy of State

Four words that are often confused, made precise:

- **Event** — a discrete thing the user *does* at a moment in time. A commit. A
  reflection. Opening the app. Events are instantaneous and countable. *The person
  performs events.*
- **Context** — the *where/when* surface a thing happens in: the Today screen, the
  Commit flow, the Archive. Context is a property of the interface. *The product
  observes contexts.*
- **State** — the user's *current relationship to their own becoming*, derived from
  evidence over time. Beginning. Building. Returning. A state can last minutes, days,
  or years. *The product serves states.*
- **Identity** — the durable self the states accumulate into ("I am someone who shows
  up"). Identity is the destination; states are the weather along the way.

The distinction matters because **a product designed around events and contexts
responds to screens; a product designed around states responds to people.** An
event-driven product asks "what did they just tap, and what screen are they on?" and
answers with features. A state-driven product asks "where is this person in their
becoming right now?" and answers with the right presence — which is often silence.

Designing around states produces calmer products because state changes slowly and
truthfully, while events are noisy and contexts are incidental. The same screen
(Today) should behave completely differently for someone in their first week
(Beginning) versus someone returning after two months away (Returning). The screen is
identical; the *state* is everything. Serving the state, not the screen, is what makes
the product feel like it knows the person rather than the page.

---

## Part 2 — Canonical States

The complete set. Each is observable from evidence, mutually understandable, and tied
to a real need.

### Beginning
- **Means:** the user is new, or has almost no evidence yet.
- **Why it exists:** the foundation has not formed; there is nothing to remember yet.
- **Needs:** an invitation, low friction, the first honest act of showing up.
- **Never:** surface memory (there is none), imply they are behind, or measure them.

### Building
- **Means:** the user is showing up with reasonable continuity; evidence is
  accumulating.
- **Why it exists:** this is the steady middle where identity is slowly built.
- **Needs:** quiet recognition, a light path to the next act, to be left alone to live.
- **Never:** escalate, gamify, or manufacture urgency to keep the momentum "up."

### Returning
- **Means:** the user has come back after a real gap.
- **Why it exists:** it is the single most emotionally important moment in the product.
- **Needs:** warmth, continuity, proof the foundation is still there.
- **Never:** mention the gap as loss, reset anything, or ask them to re-justify.

### Protected
- **Means:** the user may be in a vulnerable or heavy moment — signaled only by their
  own evidence (e.g., an `emotional` reflection they wrote), never by inference.
- **Why it exists:** some moments demand reverence and restraint above all else.
- **Needs:** safety, gentleness, the absence of anything that could reopen pain.
- **Never:** surface heavy memories casually, push, celebrate, or interpret their
  feelings.

### Witnessed
- **Means:** the user's process is currently being seen by their circle.
- **Why it exists:** being seen by a few who care is the mechanism of the product.
- **Needs:** to feel the presence quietly, "I am not becoming this person alone."
- **Never:** turn witnessing into a count, a feed, or a comparison.

### Supported
- **Means:** another person has just offered human words about the user's effort.
- **Why it exists:** it is the emotional peak — proof that becoming is witnessed.
- **Needs:** to receive the person and their words, undiluted.
- **Never:** reduce it to a tally, bury it under other feedback, or rush past it.

### Reflecting
- **Means:** the user is connecting an action to its meaning, in their own words.
- **Why it exists:** reflection deepens evidence into identity.
- **Needs:** space, silence, no interruption, their words to outrank ours.
- **Never:** prompt, coach, interpret, or turn it into journaling homework.

### Waiting
- **Means:** the user has acted and the product (or their circle) has not yet
  responded — an in-between.
- **Why it exists:** not every loop closes instantly; the pause is real.
- **Needs:** certainty that their act landed; calm, not anxiety, in the gap.
- **Never:** fill the wait with nagging, fake progress, or pressure.

### Alone
- **Means:** the user is in the process without active circle presence right now.
- **Why it exists:** belonging is not constant; solitude is a normal part of becoming.
- **Needs:** dignity in solitude — the product is enough company, quietly.
- **Never:** highlight the absence of others, or push them to recruit/compare.

### Resting
- **Means:** the user is intentionally not acting — a pause, not a lapse.
- **Why it exists:** absence is held, never punished; rest is part of continuity.
- **Needs:** to be left in peace, with the door held open without a word.
- **Never:** treat rest as failure, send guilt, or threaten loss.

### Transitioning
- **Means:** the user is changing — a new identity statement, a season shift, a
  different chapter of becoming.
- **Why it exists:** becoming has seasons; the self the user is building can move.
- **Needs:** the product to follow them into the new chapter without clinging to the
  old one.
- **Never:** surface a retired vow as "you used to want," or resist the change.

---

## Part 3 — State Transitions

Movement between states is a living system, not a flowchart. People do not click
through states; they drift, return, and overlap.

- **Common, natural transitions:** Beginning → Building (the foundation forms);
  Building ⇄ Resting (showing up, then pausing, then showing up again); Resting →
  Returning (the most important arc in the product); Building → Reflecting → Building
  (action deepened by meaning); Witnessed ⇄ Supported (presence becoming a human
  word); Building → Witnessed → Supported (the social arc at its best).
- **Rare transitions:** Beginning → Returning (you must build before there is anything
  to return to); Transitioning, which happens only occasionally over months or years.
- **Transitions that must never be forced:** never push Resting → Building (that is
  nagging an absence into action); never force Reflecting (meaning cannot be coerced);
  never rush Returning into "now do more" (it must be allowed to simply be a warm
  arrival); never drag someone out of Protected before their own evidence shows they
  have moved.

The system's job is to *follow* transitions by reading evidence, never to *drive*
them. A product that pushes people between states for its own benefit has become an
engagement engine, which the constitution forbids.

---

## Part 4 — Product Responses

For each state: what appears, what stays silent, which interactions, memories, tone,
and feedback belong. (Memory behavior is always subordinate to
`MEMORY_SELECTION_ENGINE.md`; tone always to `VOICE.md`.)

| State | Appears | Silent on | Interactions | Memories | Tone | Feedback |
|---|---|---|---|---|---|---|
| **Beginning** | An invitation; the first light act | All metrics, all memory | Show up, write the first vow | None | Warm, plain, unhurried | Identity ("your first evidence begins here") |
| **Building** | One calm anchor; a light path to act | Streaks, counts, escalation | Show up; optionally reflect | Rare, identity/reflection | Quiet, certain | Identity, occasional memory |
| **Returning** | "La base sigue ahí" + their own foundation | The gap, any reset, numbers | Show up, as if never gone | Return memory (their own past) | Warm, continuous | Memory + identity |
| **Protected** | Minimal, gentle, safe | Heavy memory, celebration, prompts | Only the lightest presence | None unless explicitly protective | Reverent, soft | Near-silence |
| **Witnessed** | A quiet sense of presence | Activity logs, counts | None required | None | Calm warmth | Human presence (felt, not broadcast) |
| **Supported** | The person and their words | Tallies, other feedback | Receive; optionally reply human-to-human | None (the live word is the moment) | Moved, plain | Human feedback, undiluted |
| **Reflecting** | Space to write | Anything that interrupts | Write; their words centered | None (do not crowd their voice) | Spacious, silent | None until they finish |
| **Waiting** | Certainty their act landed | Fake progress, nagging | None | None | Calm | System feedback (quiet confirmation) |
| **Alone** | The product as enough company | The absence of others | Show up; reflect | Identity/origin (their own) | Dignified | Identity |
| **Resting** | An open, quiet door | Guilt, loss, "come back" | None | None | Patient, silent | None |
| **Transitioning** | The new chapter, on its own terms | The old/retired self | Update the vow; carry forward | New-chapter identity only | Following, warm | Identity (the new becoming) |

The throughline: the more vulnerable or restful the state (Protected, Resting,
Reflecting), the more silence wins; the more relational the state (Supported,
Witnessed), the more a *person* — never a number — belongs.

---

## Part 5 — State Priority

States coexist. A person can be Returning, Supported, and Reflecting at once. When
they conflict, resolution is deterministic, and **human state always beats feature
context.** The interface never wins over the person.

Priority, highest first:

1. **Protected** — safety and reverence override everything. If the user's own
   evidence places them here, nothing heavy surfaces, full stop.
2. **Returning** — the sacred arrival. When someone comes back, that is the moment to
   serve, above ordinary recognition.
3. **Reflecting** — when the user is writing meaning, their voice is centered and
   nothing interrupts it.
4. **Supported / Witnessed** — human presence outranks any system or feature response.
5. **Transitioning** — a real change of self is served before steady-state behavior.
6. **Beginning** — the first foundation before anything else assumes one exists.
7. **Building** — the steady default.
8. **Waiting / Alone** — in-between states, served calmly when nothing higher applies.
9. **Resting** — the quietest default; when in doubt and no signal is present, hold
   the door and do nothing.

The rule of thumb: **safety, then return, then the user's own voice, then people, then
everything else — and the screen's needs come last, always.**

---

## Part 6 — Invalid States

Gym Circle refuses to create these states in a user. Each is a state other products
manufacture for engagement, and each violates the Product Bible:

- **Competitive** — turns becoming into rank; another's process becomes a yardstick.
  Violates "witness, do not judge" and the leaderboard ban.
- **Addicted** — optimizes for compulsive return; the app wants continuity, not
  attention. Violates "calm over engagement."
- **Fearful** — built from loss aversion (broken streaks, countdowns). Violates
  "absence is held, never punished" and the streak ban.
- **Obsessive** — encourages over-checking and over-measuring. Violates restraint and
  "the sacred act must stay light."
- **Behind** — manufactures a deficit against a standard. Violates "we reinforce
  identity, never guilt."
- **Winning / Losing** — frames becoming as a game with outcomes. There is no finish
  line; success is continuity, not a target hit.
- **Productive** — reduces the person to throughput. Violates "we remember; we do not
  count" and "meaning over functionality."

If a feature would push a user into any of these states, it is rejected — the state
itself is the disqualifier, regardless of how the feature is built.

---

## Part 7 — Time

A state's meaning changes with how long it lasts. Time is part of the state, not a
separate axis.

- **Resting** for a day is a healthy pause; the response is silence. **Resting** for
  three months is a long absence — but the response is *still* silence and an open
  door, never escalating pressure, because the principle does not change with
  duration. What changes is what becomes possible *when they return*: a longer rest
  makes the Returning moment more significant, not more punished.
- **Beginning** lasts only until enough evidence forms; it cannot be re-entered, and a
  user should not be held there.
- **Building** is the long steady state, measured in months and years.
- **Protected** should be short-lived and is exited only when the user's *own* evidence
  shows movement — never on a timer the product decides.
- **Transitioning** unfolds over months; it must not be rushed to completion.

The discipline: **duration may change what is appropriate to offer, but never which
principle applies.** Longer absence never converts "hold the door" into "push." Time
deepens meaning; it never licenses pressure.

---

## Part 8 — Future Compatibility

Every future capability must first determine the user's *state* before acting. State
is the precondition for behavior, regardless of surface.

- **Voice** must read the state before speaking — gentle in Protected, warm in
  Returning, silent in Resting. A voice that speaks the same way in every state is
  noise.
- **AI** must serve the state from the user's own evidence, never infer a psychological
  state or generate one. It determines *where the person is* from facts, then behaves
  per Part 4.
- **Wearables** must check state before buzzing — never interrupt Resting or Protected;
  presence on the wrist only when Witnessed/Supported genuinely applies.
- **Coach** must recognize the state before responding — never "push" someone who is
  Resting or Protected; never coach during Reflecting.
- **Widgets** must reflect the state quietly — the identity in Building, the open door
  in Resting — never a metric that ignores where the person is.
- **Notifications** must be gated on state — a notification is only ever sent when the
  state warrants a human word, never on a schedule that ignores Resting/Protected.
- **Future devices** inherit the same contract: *observe the state, then behave.*

**Why this survives platform changes:** state is a property of the *person*, not the
device. Any new capability, on any future hardware, can ask "where is this person?"
and is bound to answer correctly before acting. The state system is therefore a
forward-compatible gate on all future behavior.

---

## Part 9 — Engineering Boundaries

**State detection is not emotion detection.** This is the architectural line that must
never be crossed.

- The product **observes evidence, not minds.** A state is derived from observable
  facts the user created: the recency of their last commit, the presence of a gap, a
  support just received, an `emotional`-typed reflection they themselves wrote, a
  changed identity statement. These are evidence, not inferences.
- The product **never infers feelings.** It does not run sentiment analysis, does not
  guess mood, does not model the user's psychology. "Protected" is entered because the
  user wrote something heavy in their own words — not because an algorithm decided they
  are sad.
- The product **never predicts psychology.** No churn-risk, no "likely to relapse," no
  behavioral forecasting. Prediction is the doorway to manipulation, which the
  constitution forbids.
- The product **never classifies people.** A state describes a *relationship to
  evidence right now*, not a label on a person. It is transient, reversible, and
  derived — never a profile, a segment, or a type.

**Architectural implications:** state derivation must be deterministic, explainable,
and traceable to specific evidence — the engine can always state *which fact* placed
the user in a state. It reads only the existing immutable evidence substrate
(commits, reflections, supports, identity statement, circle), requires no new emotional
data, stores no inferred attributes, and (consistent with `DATABASE.md`) is a derived
concept, not a profiling table. If state derivation ever required guessing a feeling,
the correct answer is to not derive that state.

---

## Part 10 — Final Verdict

- **Features** answer *actions*.
- **Interaction** answers *behavior*.
- **Memory** answers *continuity*.
- **State** answers *presence*.

Gym Circle should always know not *what happened*, and not *what screen is open*, but
**where the person is.** Implementation must never begin from a screen; it must begin
from a human state, read honestly from evidence, and behave the way that state
deserves. A product that knows where its user is — and serves that, calmly, often with
silence — is a product that feels less like software and more like being known.

The philosophy governs behavior; behavior is shaped by state; state governs
implementation. Never the reverse.

---

## Reference Sources

- `PRODUCT_BIBLE.md` — why the product exists; Part 6 (emotional journey) is the
  lived arc these states formalize.
- `INTERACTION_SYSTEM.md` — how the product behaves; state shapes which behavior
  applies.
- `MEMORY_SELECTION_ENGINE.md` / `MEMORY_GOVERNANCE.md` — which memories belong in a
  state, and the rule against inference these boundaries share.
- `VOICE.md` — the tone each state speaks in.
- `DATABASE.md` — the immutable evidence substrate states are derived from.
