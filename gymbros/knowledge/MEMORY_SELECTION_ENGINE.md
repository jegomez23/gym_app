# Memory Selection Engine

Question: How does memory decide what to return?

Last reviewed: 2026-06-24 (Phase 24 — Memory Selection Engine)

This document is canon. It serves `PRODUCT_BIBLE.md` and is governed by
`PRINCIPLES.md`. When any feature, decision, or piece of code that resurfaces a
user's past conflicts with the rules written here, this document wins.

`VOICE.md` defines how the product speaks; this document defines when it should
speak at all by returning a memory — and, far more often, when it should stay
silent.

---

## What this governs (the Memory Engine, inline)

The **Memory Engine** is the product capability that returns a user's own evidence
to them at meaningful moments — their own commits, reflections, supports, and the
identity statement they wrote — so the product *remembers them*, not their
statistics. (A dedicated `MEMORY_ENGINE.md` describing the *what* in full is
forthcoming; this paragraph states the concept inline so this document stands on its
own.)

The **Memory Selection Engine** is the layer beneath it. Its responsibility is one
decision: given everything a person has ever created, which single memory — if any —
deserves to return right now? Most of the time the correct answer is **nothing**.
Silence is the default output, by design.

This is the most dangerous power in the product: returning someone their own past.
It must be governed at the same altitude as `PRINCIPLES.md` and `VOICE.md`.

---

## Part 1 — Selection Philosophy

**Why selection is harder than storage.** Storage is mechanical, bounded, and
already solved: keep the immutable log, never mutate, never delete. Selection is
judgment under emotional stakes. Storage keeps everything; selection must throw
almost everything away and be right about the sliver it keeps. A wrong stored row is
invisible. A wrong surfaced memory is felt, and erodes trust that took years to
earn. The hard part is not recall — it is restraint.

**Why forgetting is necessary.** Total recall is noise. Meaning requires scarcity. A
memory that is always available is wallpaper. The engine's act of *choosing not to
surface* the other 99.9% of evidence is what gives the rare surfaced memory its
weight. Forgetting on the user's behalf — reversibly, since the evidence still lives
in the Archive — is a feature, not a limitation.

**Why silence is part of the product.** An empty open signals "this app is not
trying to take your attention" — the felt quality the ten-year vision is built on
(Principles 10, 17). Silence is the most common and most trustworthy thing the
engine says.

**When showing nothing creates more trust than showing something.** Whenever no
candidate clears the absolute bar of *true + meaningful + timely right now*. A
forced memory feels algorithmic and cheapens every future one. Absence feels
respectful and protects the rare hit.

**How memory should feel.** Discovered, not delivered. Inevitable in hindsight, in
the user's own voice, gentle. Like a trusted person who happens to remember the
right thing at the right moment — never a system performing recall.

**Optimize for truth, never engagement.** The engine's success metric is not open
rate, surfacing rate, or dwell time. Success is: when something appears, the user
trusts it is true and earned. That trust is the entire asset.

---

## Part 2 — Memory Taxonomy

Each category is built only from evidence that already exists: commits; reflections
typed `identity | emotional | process | technical`; supports; `identity_statement`;
circle join dates; and firsts/gaps derived from the immutable log.

| Category | Purpose | Emotional value | Risk | Lifetime | Ideal moments | Priority |
|---|---|---|---|---|---|---|
| **Identity** (the vow + identity-type reflections) | Reconnect the user to the self they chose | Highest | Low (their own words) | Permanent, appreciates | Quiet Return, Commit recognition, Profile | 1 |
| **Return** (evidence the foundation survived a gap) | Make "la base sigue ahí" literal proof | Highest, at the most important moment (Bible Pt 6) | High — mishandled = guilt about absence | Born only on a real return; appreciates into a returns-archive | Quiet Return **only** | 1 (context-bound) |
| **Origin / Beginning** (first commit, first reflection, first showing-up) | Show distance traveled; then vs now | Very high, grows with age | Mild if framed as decline ("you used to…") — forbidden framing | Dormant early, sacred after ~90d–1y | Milestones, return, Profile | 2 |
| **Reflection** (user's own action→meaning words) | The user's voice outranks ours | High | `emotional` type can carry pain | Appreciates as words age | Commit recognition, Archive | 2 |
| **Turning-point** (hardest week, longest-gap return, season of change) | The narrative of becoming | Very high, only legible after time | Inferring significance the user never claimed — be conservative | Emerges only after years | Rare, deep milestones | 2 |
| **Support** (human words received from circle) | Proof that becoming is witnessed (emotional peak) | High | Cross-user privacy; reliving | Medium, mild appreciation | Rare, on return or low period | 3 |
| **Circle / Relationship** ("the person who never stopped," shared history) | Belonging — not becoming alone | High | Other person's privacy; comparison | Appreciates with relationship age | Circle surface, milestones | 3 |
| **Quiet victory** (showing up on a low day, the unremarkable commit) | Honor presence over performance | Medium, quietly powerful | Low | Medium | Today, occasional | 4 |
| **Foundation** (accumulated mass of evidence) | The base they built, as evidence not count | Medium | **High** — slips into statistics/streaks | Grows | Profile, milestones | 5 (heavily guarded) |

**Categories that must never exist:** streak memories, comparison memories (vs
others or vs a "better" past self), performance-record memories (PRs as
achievement), and absence / "missed day" memories. All are banned by `PRINCIPLES.md`.

---

## Part 3 — Selection Model (product logic, not code)

Two stages. **Stage A — eligibility gates** are binary and ruthless; failing any one
disqualifies a candidate. **Stage B — scoring** ranks the survivors, and only the
single top candidate that *also* clears an absolute meaning threshold surfaces. If
none clears, the output is silence — the most common result.

### Variables that should exist

- **Truthfulness** *(gate)* — is the connection to *now* real, or a coincidence
  dressed as meaning? Low truth disqualifies. Trust is the moat.
- **Context fit** *(gate)* — does this memory belong in *this* moment? A return
  memory outside a return is disqualified, not merely penalized.
- **Potential emotional harm** *(gate)* — pain requires explicit protection; high
  harm disqualifies regardless of every other score.
- **Cooldown / already-resurfaced** *(gate + penalty)* — recently surfaced memories
  are excluded for a long window; prevents wallpaper.
- **Identity relevance** — how directly the memory connects to the user's stated
  becoming. Highest positive weight; it is the core purpose.
- **Reflection / language richness** — a memory carrying the user's own vivid words
  outranks a bare commit. Weight toward their voice (Principle 13).
- **Age / maturation** — older evidence is often *more* valuable (distance
  traveled). Positive weight — the opposite of a recency-ranked feed.
- **Recency penalty** — very recent evidence is not memory yet; it is still present.
  Penalize the near term so memory never means "what you just did."
- **Life / relationship significance** — turning points and long relationships score
  higher, applied conservatively.
- **Future significance** — would this matter *more* later? If yes, the engine may
  withhold it now (it has patience; see Rule 10).
- **Rarity / surprise** — a memory the user has likely forgotten lands harder than
  one fresh in mind. Mild positive — surprise must serve truth, never stimulation.
- **Calmness** — would surfacing keep the moment calm? Negative if it would spike or
  agitate.

### Variables that must never exist

- Predicted engagement / open-rate / dwell time — optimizing attention is the enemy
  of the product.
- Virality / shareability — the product is private.
- Comparison-to-others score — banned by `PRINCIPLES.md`.
- Inferred mood/sentiment via ML — identity is claimed, never assigned; never infer
  feelings the user did not write.
- Streak / consistency score — manufactures broken-chain anxiety.
- Re-engagement / churn-risk signals — turns memory into retention manipulation.

The model's defining property: it is **biased toward silence**. The threshold sits
high enough that, on a typical day, the best available memory is correctly judged
not good enough — and nothing appears.

---

## Part 4 — Context Engine

| Context | Memory appears? | Max frequency | Ideal types | Forbidden types |
|---|---|---|---|---|
| Opening Today (normal) | Usually silence | ~1 / week ceiling | Quiet victory, identity | Return, heavy emotional |
| **Quiet Return** (after a real gap) | **Yes — prime moment** | Each genuine return | Return, identity | Statistics, comparison, anything implying loss |
| After leaving evidence (Commit recognition) | Yes, lightweight | Vary; not every time | Identity/reflection echo of the vow the act proves | Heavy pain, foundation counts |
| Starting new evidence | Silence | — | none | everything (keep the sacred act frictionless) |
| Opening Archive | Memory is *pull* here; rare gentle header only | Very low | Origin, reflection | Push interruptions |
| Opening Profile | Yes, low frequency (it is a mirror) | Low | Identity, origin | Numbers-as-headline |
| Receiving support | Silence (the live support is the moment) | — | none | anything that buries the live moment |
| Sending support | Silence (focus on the other person) | — | none | everything |
| Circle milestone (long connection) | Rare | Very low | Circle / relationship | Comparison between members |
| Season / turning point | Very rare, only after years | Yearly-ish ceiling | Turning-point, origin | Forced "wrapped" recap |
| First evidence | **No** (nothing to remember yet) | — | none (invitation instead) | all memory |
| Hundredth evidence | Guarded or silence | Once | Foundation as evidence | "100!" count, streak |
| One / three / ten years later | Sacred, rare | Once each | Origin, return-archive | Automated anniversary push |

**Governing rule:** the more sacred and light the action (starting evidence, first
commit), the more silence wins. The more reflective the pause (return, profile,
archive), the more a memory may belong.

---

## Part 5 — Priority Rules (deterministic hierarchy)

1. **Safety first.** A harm-flagged memory is excluded unless the context is
   explicitly protective. Pain never surfaces casually.
2. **Context gate.** A memory must fit the moment or it does not appear.
3. **Truth gate.** No real connection to *now* → silence.
4. **The user's own words outrank any generated framing.** Always.
5. **Category order:** Identity ≻ Reflection ≻ Support ≻ Circle ≻ Quiet victory ≻
   Foundation. (Supports never outrank identity. Origins outrank statistics —
   statistics barely qualify at all.)
6. **Cooldown.** Never surface the same memory twice within a long window (months);
   sacred memories rest far longer or surface once ever.
7. **One memory at a time.** Never two. Never a stream.
8. **Silence beats a weak memory.** Top candidate below the absolute threshold →
   nothing.
9. **Explainability.** The engine must always be able to state, internally and
   auditably, *why* it selected. No unexplainable selection ships. (This is the guard
   against "feels algorithmic / feels random.")
10. **Patience.** A memory that will matter more later may be withheld now — do not
    spend a one-year memory on day forty.

---

## Part 6 — Memory Lifecycle

- **Birth** — evidence is created (commit / reflection / support). It is not yet a
  memory, only evidence.
- **Dormancy** — the default and healthy state. Most evidence stays dormant forever
  and is never surfaced. That is correct.
- **Eligibility** — evidence becomes eligible only when context, age, and meaning
  conditions could plausibly match. Transient and conditional.
- **Selection** — among eligible candidates, at most one may be chosen, rarely.
- **Resurfacing** — the chosen memory returns to the user once, gently.
- **Rest** — long cooldown after surfacing; it cannot return soon.
- **Retirement** — some memories age out or are superseded (e.g., an early identity
  statement replaced by a new vow). Retained, but no longer surfaced.
- **Deletion** — the user deletes the source evidence → memory eligibility dies
  immediately and totally. No memory outlives its source.

**Why memories appreciate instead of decay:** distance. A first reflection means
little at day two and everything at year two. The engine is *built to hold evidence
dormant* precisely so it can appreciate. Time is the asset, and dormancy is how the
asset compounds.

---

## Part 7 — Failure Modes

| Failure | Why it happens | How the engine prevents it |
|---|---|---|
| Too repetitive | No cooldown | Strong already-resurfaced penalty + hard cooldown (Rule 6) |
| Too predictable | Fixed cadence / slot | No schedule; discovered, not delivered; context-driven and variable |
| Feels algorithmic | Visible pattern, too frequent, generic | Rarity, truth gate, explainability (Rule 9), the user's own words |
| Feels manipulative | Timed to re-engage; emotional spikes | Banned engagement variables; harm gate; calmness weight |
| Feels random | No tie to context | Context gate + truth gate; randomness is disqualified by design |
| Feels like social media | Comparison, feed, others' lives | Private-only; no comparison variable; one-at-a-time; no scroll |
| Feels like Timehop | Automatic "on this day" date recap | No calendar-triggered surfacing; memory is tied to meaning, not the date |
| Feels like a quote app | Generic content, not the user's | Only the user's own evidence ever surfaces (ZenQuotes already rejected) |
| Feels like engagement optimization | Success measured in opens | Success metric is trust, not engagement; banned variables |
| Feels like therapy | Interpreting feelings, prompting processing | Present evidence plainly; never interpret; never prompt |
| Feels like journaling | Asking to write/review entries | Memory is a push of the past, not a writing surface; Archive stays separate |
| Feels like nostalgia | Past for its own sake | Truth gate — memory must connect to *now* and serve identity, not sentiment |
| Feels like guilt | Surfacing absence as loss | Absence is never punished; gaps only ever frame a warm return |
| Feels like comparison | Vs others or vs a better past self | Comparison and decline framing are banned |

---

## Part 8 — Ethical Guardrails (extends the Memory Principles)

**Never:** optimize engagement; infer emotion via ML; surface pain casually; punish
absence; compare; repeat the same memory; surface to the wrong audience; put words in
the user's mouth; establish a predictable cadence; use memory as a notification hook.

**Always:** default to silence; use the user's own words; connect to now; be
internally explainable; honor deletion totally; respect the source's visibility;
treat pain reverently; surface one memory at a time.

- **Protect users** with a harm gate, conservative significance, and zero inference
  of unstated feelings.
- **Protect trust** by making truthfulness a *gate*, not a weight — one manipulative
  memory costs years of earned trust.
- **Protect silence** structurally: thresholds are set so most moments produce
  nothing. Silence is a first-class output, not a fallback.
- **Avoid emotional dependency:** no cadence, no streak, deliberate rarity. The app
  wants continuity, not attention. If a user could predict the next memory, the
  engine has failed.

---

## Part 9 — Long-Term Evolution

- **30 days** — near-total silence; perhaps one gentle reflection echo. The engine is
  mostly dormant, which is correct.
- **90 days** — returns become real; the first origin contrasts; "the line that
  traveled" (early vs recent identity reflection, the user's own words, no
  commentary).
- **1 year** — origin memory turns sacred; "the person who never stopped"; the first
  legible turning points.
- **3 years** — the returns-archive ("you have come back six times — you are someone
  who returns"); seasons of change; deep relationships.
- **10 years** — the engine holds a record of a life the user has forgotten; opening
  it is meeting a younger self who was already becoming this person. Memories become
  inheritance.

**It evolves without changing philosophy.** The gates and the silence-default never
change; only the *pool* of eligible, appreciated memories grows. The engine does not
get louder over time — it gets wiser, because it has more true things to choose from.

- **Possible only after years:** turning points, the returns-archive, decade origins.
- **Sacred:** first showing-up, first return, first support, the original vow.
- **Must never return:** pain the user did not ask to revisit; a retired/superseded
  vow surfaced as "you used to want"; anything reframing absence as failure.

---

## Part 10 — Competitive Analysis

| Product | Optimizes for | Why Gym Circle differs |
|---|---|---|
| Apple Photos / Google Photos Memories | Delight + re-engagement via ML clustering and auto-montages, on a cadence | GC: truth + identity, the user's words, rarity; no ML inference; meaningful over pretty |
| Spotify Wrapped | Shareability, virality, an annual dopamine/marketing spike; stats as spectacle | GC: anti-viral, private, never a stats recap, no annual performance |
| Readwise | Spaced-repetition resurfacing of highlights (others' words), cadence-based | GC: the user's *own* words, meaning-triggered not spaced, silence by default |
| Stoic | Curated external wisdom + mood tracking + prompts | GC: rejected external content (ZenQuotes), no mood inference, no prompting |
| Day One | Journaling — user writes and browses; "On this day" date recap | GC: not a writing surface; memory is meaning-pushed, not date-pushed |
| Timehop | Pure date-based nostalgia recap as an engagement hook | GC: explicitly the anti-Timehop; no calendar trigger |
| Facebook Memories | Re-engagement + ad surface; surfaces regardless of emotional safety | GC: harm gate, reverence, never re-engagement |

**What they optimize:** attention, delight, virality, cadence, completeness.
**What Gym Circle optimizes:** truth, identity, calm, rarity, the user's own voice.

**Why it is harder to build.** The easy path is ML + cadence + completeness — and
everyone takes it. Gym Circle forbids all three. It must select by *meaning* with
*restraint*, judged by *trust* rather than metrics, with no engagement A/B test
allowed. Building for "shows almost nothing, but the rare thing is true" is far
harder than "show something delightful every day."

**Why it is more defensible.** The moat is **time × trust × the user's own private
words.** It cannot be imported, cannot be faked, and is destroyed by exactly the one
manipulative move every competitor is structurally incentivized to make. The
restraint is the moat.

---

## Part 11 — Future Architecture (responsibilities and boundaries; no code)

- **Context Engine** — detects the current moment (return, recognition, archive-open,
  …) and its constraints (max frequency, allowed/forbidden types). *Boundary:* knows
  *where/when*, never *what*. *Why:* selection depends on context.
- **Eligibility Engine** — reduces all evidence to the small candidate set passing the
  hard gates (age, cooldown, context fit, source visibility, deletion). *Boundary:*
  filters; does not rank or judge meaning depth. *Why:* cheap reduction before
  expensive judgment; this is where forgetting is enforced.
- **Memory Selection Engine** — scores eligible candidates on the meaning dimensions
  and picks at most one that clears the absolute threshold, else returns silence.
  *Boundary:* chooses; does not render or fetch raw data. *Why:* the judgment core.
- **Memory Policy Engine** — owns the rules, weights, thresholds, and priority
  hierarchy (Parts 3 & 5) as declarative, versioned policy. *Boundary:* defines *how*
  to judge; Selection executes it. *Why:* the philosophy must be auditable and
  evolvable without rewriting logic — ten-year governance.
- **Safety Layer** — a cross-cutting veto: harm gate, pain protection, audience and
  visibility checks, comparison/guilt/decline bans. *Boundary:* can only *remove*
  candidates or block surfacing, never add. *Why:* ethics must be unbypassable and
  independent of scoring.
- **Future Memory Ledger** — append-only record of what was surfaced, to whom, when,
  and what was deliberately withheld for later. Powers cooldown, rarity, and patience.
  *Boundary:* bookkeeping of IDs/timestamps only — no feelings, no scores about the
  person. *Why:* rarity and non-repetition require a memory-of-memory. This is the only
  genuinely new persistence the capability needs, and it stores metadata, not emotion.
- **Selection Pipeline** — orchestrates Context → Eligibility → Selection (via Policy)
  → Safety → (surface or silence) → Ledger. *Boundary:* wiring only, no judgment of its
  own. *Why:* one ordered path, with silence as a first-class output.

All reads come from existing immutable evidence (commits, reflections, supports,
`identity_statement`, circle). No new domain tables are required except the Ledger,
eventually — consistent with `DATABASE.md`'s "derived concept, no MVP table unless
performance proves otherwise."

---

## Part 12 — Final Verdict: what this document is

**If the Product Bible is the heart of Gym Circle, the Memory Selection Engine is its
conscience** — the faculty that decides, in each moment, whether returning a piece of
the user's past serves who they are becoming or violates it. The Bible says *remember
who they are becoming*; this engine is the mechanism that does the remembering
responsibly, one decision at a time. It is where philosophy stops being a value and
becomes a verdict.

It sits at the highest architectural altitude because nearly every emotional surface
— Today, Quiet Return, Commit recognition, Profile, Archive, Circle — will eventually
call it, and a single wrong default would break the trust moat across all of them at
once.

**How future engineers must treat this document:** as canon, not suggestion. No
memory-surfacing code ships without satisfying its gates. Selection logic must trace
to the Policy Engine rules defined here. Changing a weight or threshold requires
updating this document and likely an ADR. Silence is the default and must be
preserved. An engagement metric must never be added.

---

## Reference Sources

- `PRODUCT_BIBLE.md` — why the product exists (highest source of truth); Part 6 (the
  return moment) is the emotional anchor this engine governs.
- `PRINCIPLES.md` — the immutable principles and never-build blacklist this engine
  extends into selection ethics.
- `VOICE.md` — how a surfaced memory must speak when it speaks at all.
- `DATABASE.md` — memory as a derived concept; the immutable evidence substrate.
- `MEMORY_ENGINE.md` — the *what* of memory (forthcoming; concept stated inline above).
