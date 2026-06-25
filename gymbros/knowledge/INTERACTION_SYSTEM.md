# Interaction System

Question: How should Gym Circle behave during every interaction?

Last reviewed: 2026-06-24 (Phase 26 — Emotional Interaction System)

This document is canon. It is the **behavior layer** of Gym Circle — the invisible
rules that govern how every interaction should _feel_, independent of visual design,
animation specs, or components. `PRODUCT_BIBLE.md` defines why the product exists;
`VOICE.md` defines how it speaks; `PRINCIPLES.md` defines what it refuses to become;
the memory documents define what it remembers. **This document defines how it
behaves.** Without it, the philosophy stays invisible.

It is the equivalent of Apple's Human Interface Guidelines or Linear's motion rules,
but written one level higher than craft: it is about emotional behavior, not pixels.
The design system implements these rules; it does not define them. When a visual or
interaction decision conflicts with what is written here, this document wins, and the
hierarchy above it (`PRODUCT_BIBLE.md` → `VOICE.md` → `PRINCIPLES.md`) wins over it.

---

## Part 1 — The Feeling

Every interaction in Gym Circle should leave a person feeling a specific set of
_qualities_ — not emotions to be performed, but a steady texture the product never
breaks:

- **Calm.** Nothing competes for them. The interaction lowers their pulse rather than
  raising it. Calm is the precondition under which identity is actually built; an
  anxious user performs, a calm user becomes.
- **Certainty.** The product is sure of itself, so the user can stop bracing. Quiet
  confidence, never hype. Certainty tells the user they are in capable hands and can
  let their guard down.
- **Warmth.** It speaks to them like a trusted person, not a brand. Warmth without
  sentimentality — real, plain, unembarrassed.
- **Dignity.** It assumes the user is serious and capable. It never talks down,
  never flatters, never manipulates. Dignity is what separates recognition from
  praise.
- **Continuity.** The product behaves as if the relationship is ongoing and
  unbroken — even after absence. Nothing resets; nothing is lost. Continuity is the
  felt proof that the foundation is still there.
- **Restraint.** The product holds back. It does less than it could, always. Restraint
  is what makes the rare moment land and what signals the app is not trying to take
  something.

Why these: each is the _opposite_ of what an engagement product cultivates (urgency,
doubt, flattery, performance, novelty, excess). The interaction system exists to make
these qualities inevitable and their opposites impossible.

---

## Part 2 — Interaction Principles

These are immutable. Every interaction must satisfy all of them.

1. **Nothing rushes.**
   - _Why:_ haste manufactures anxiety; the sacred act of showing up must feel
     unhurried.
   - _Example:_ a screen lets the user arrive and breathe before asking anything.
   - _Anti-example:_ a countdown, an auto-advancing flow, a "complete in 2 minutes."

2. **Nothing celebrates loudly.**
   - _Why:_ recognition names the person; celebration rates the achievement.
   - _Example:_ "Apareciste." after a commit.
   - _Anti-example:_ confetti, "🎉 Session complete!", a triumphant sound.

3. **Nothing asks twice.**
   - _Why:_ every prompt is a cost imposed on the user; repetition is disrespect.
   - _Example:_ a confirmed action is trusted and not re-queried.
   - _Anti-example:_ "Are you sure?" after an already-deliberate action; repeated
     onboarding nags.

4. **Nothing blames.**
   - _Why:_ shame is corrosion, not motivation; absence is held, never punished.
   - _Example:_ a return is met with "La base sigue ahí."
   - _Anti-example:_ "You've missed 6 days," a broken-streak warning, a red mark.

5. **Silence is allowed.**
   - _Why:_ not every moment needs feedback; the most respectful response is often
     nothing.
   - _Example:_ an ordinary open that surfaces nothing and simply lets the user be.
   - _Anti-example:_ a tip, a nudge, or a "did you know?" filling a quiet moment.

6. **Confirmation matters.**
   - _Why:_ a sacred act must be felt to have landed; the user should never wonder if
     it counted.
   - _Example:_ a quiet, certain beat of recognition that the evidence was sealed.
   - _Anti-example:_ a silent state change with no acknowledgment, or an over-loud toast.

7. **The interface waits.**
   - _Why:_ the product moves at the user's pace, not its own; it does not pull.
   - _Example:_ the next step appears only when the user reaches for it.
   - _Anti-example:_ auto-redirects, forced tours, modals that interrupt.

8. **People matter more than numbers.**
   - _Why:_ the product witnesses; it does not measure. A human word outranks any count.
   - _Example:_ "Te vieron hoy." with a person attached.
   - _Anti-example:_ "+1 support", "3 interactions", a tally of reactions.

9. **Identity before activity.**
   - _Why:_ the product reflects who the user is becoming before it shows what they
     did.
   - _Example:_ the identity statement anchors a screen; activity is secondary.
   - _Anti-example:_ a dashboard of metrics as the first thing a user sees.

10. **The interaction disappears once its purpose is fulfilled.**
    - _Why:_ the product wants the user's continuity, not their attention; it gets out
      of the way.
    - _Example:_ after recognition, the moment rests and releases the user to their
      life.
    - _Anti-example:_ "while you're here…", suggested next actions, an attention loop.

11. **One anchor per moment.**
    - _Why:_ a single clear thing that matters is a form of calm; equal shouting is
      noise.
    - _Example:_ one primary action or one piece of recognition per screen.
    - _Anti-example:_ a wall of equally weighted cards, three competing CTAs.

12. **Effort is met with proportion, not escalation.**
    - _Why:_ the response to showing up is steady recognition, never an inflating
      reward.
    - _Example:_ the hundredth commit is recognized as quietly as the first.
    - _Anti-example:_ bigger animations, louder praise, or tiers that grow with use.

13. **The user is never made to perform.**
    - _Why:_ the product is private evidence, not a stage; nothing is built to be
      shown off.
    - _Example:_ actions feel like they are _for the user_, witnessed by a few.
    - _Anti-example:_ share prompts, public-facing flair, anything that invites display.

14. **Trust the user's deliberate action.**
    - _Why:_ friction belongs only before irreversible harm, never before ordinary
      intent.
    - _Example:_ a commit is recorded the moment the user means it.
    - _Anti-example:_ gating a light, honest act behind confirmations and forms.

---

## Part 3 — Emotional Rhythm

Every interaction follows the same arc, and always ends in rest:

```
Arrival  →  Orientation  →  Action  →  Recognition  →  Rest
```

- **Arrival.** The user enters a calm space. Nothing assaults them; the product lets
  them land before it asks anything.
- **Orientation.** One clear anchor tells them what matters here. Hierarchy does the
  work so they never have to.
- **Action.** The sacred act — showing up — costs almost nothing. Minimal taps,
  minimal decisions, minimal friction.
- **Recognition.** The act is met with something that names the person, not a number
  that rates them. Brief, certain, identity-shaped.
- **Rest.** The interaction completes and releases the user. The product does not try
  to extend the session.

**Why Gym Circle always ends in rest, never stimulation.** Every other product closes
a loop by opening another — recognition becomes a prompt, a prompt becomes a feed, a
feed becomes a session. That is the architecture of attention capture. Gym Circle ends
in rest because its goal is the opposite: it wants the user to close the app and go
live the life where identity is actually built. Rest is the product keeping its
promise that it is not trying to take something. A user who leaves calm and seen will
return out of continuity; a user left stimulated returns out of compulsion, and
compulsion is the thing we refuse to manufacture.

---

## Part 4 — Motion Philosophy

Motion is communication, never decoration. (Specs live in the design system; this is
the philosophy.)

- **When things should move:** only to confirm that an action landed, that a moment is
  sacred, or that a transition is real. Motion carries meaning the user would otherwise
  have to infer.
- **When things should stay still:** by default. Stillness is the resting state.
  A static interface is a calm interface; movement is the exception that earns
  attention precisely because it is rare.
- **When things should disappear:** the moment their purpose is served. A confirmation
  that has been understood should recede; a recognition that has been felt should rest.
  The interface removes itself rather than lingering.
- **When nothing should happen:** whenever motion would only entertain. If an animation
  does not communicate — if it merely delights, decorates, or fills time — it is noise
  and must not exist. The sacred moments (showing up, being witnessed, returning) earn
  a beat of stillness and recognition; everywhere else, motion disappears into the
  background.

The test for any motion: _does this tell the user something true that they need to
know right now?_ If not, it should not move.

---

## Part 5 — Feedback Philosophy

Every action returns something — but the _kind_ of feedback determines what the user
feels. Gym Circle classifies feedback by emotional purpose, and chooses the highest
form available:

- **Identity feedback.** Names who the user is becoming. ("Apareciste." / "Una prueba
  más de quién estás eligiendo ser.") _Purpose:_ convert action into self-recognition.
  This is the highest form; prefer it whenever possible.
- **Memory feedback.** Returns the user's own past — a reflection, an origin, a vow.
  _Purpose:_ prove the foundation is real and still there. Governed by
  `MEMORY_SELECTION_ENGINE.md`; rare and true by design.
- **Human feedback.** Carries another person and their words. ("Te vieron hoy.")
  _Purpose:_ the felt proof that becoming is witnessed — the emotional peak. Never a
  count, always a person.
- **System feedback.** Confirms an act landed (a commit sealed, a setting saved).
  _Purpose:_ certainty — the user never wonders if it counted. Quiet and brief.
- **Error feedback.** See Part 7. _Purpose:_ preserve dignity and offer a way forward.

The ordering is deliberate: when more than one form is available, identity and human
feedback outrank system feedback, and the user's own words (memory) outrank anything
we could generate. System feedback is necessary plumbing, never the headline.

---

## Part 6 — Silence

Silence is not the absence of design. It is one of the product's most deliberate
behaviors, and it deserves its own chapter.

**When the interface should intentionally do nothing.** When there is no true thing to
say. An ordinary open with no meaningful memory, no human word, no act to confirm —
the correct response is a calm, complete screen that asks nothing and reports nothing.
Most moments are like this, and that is healthy.

**Why empty space is a feature.** Generous space tells the user there is no rush,
nothing is competing for them, and they are allowed to be here slowly. Empty space is
breath. A dense interface says "attend to all of this"; an open one says "rest." Empty
states are invitations, not voids — they hold the door open ("Tu primera evidencia
empieza aquí.") rather than reporting absence.

**Why pauses are part of trust.** Every moment the product _could_ speak and chooses
not to is a small deposit of trust — proof that it is not trying to take attention. A
product that fills every silence trains the user to tune it out; a product that
respects silence earns the rare moment it does speak. Pauses are how the interface
demonstrates restraint without announcing it.

**When removing feedback is better than adding it.** Whenever feedback would only
decorate, reassure redundantly, or manufacture a moment. If the user already knows
their action landed, an extra toast is noise. If a state is obvious, narrating it is
condescension. The discipline is to ask not "what feedback can we add here?" but "is
any feedback actually owed here?" — and to default to none.

---

## Part 7 — Error Philosophy

Gym Circle fails the way a calm, capable person fails on your behalf: quietly, without
drama, and always with a way forward.

- **Never dramatic.** No alarm, no red walls, no shaking. An error is an inconvenience,
  not a crisis, and the interface treats it that way.
- **Never technical.** The user never reads a stack trace, a status code, or "request
  failed." Errors speak human language. ("No pudimos cargar esto. Intenta de nuevo." —
  not "Error: 500.")
- **Never blaming.** The error never implies the user did something wrong. It owns the
  problem on the product's side and never accuses.
- **Never urgent.** No pressure to act immediately, no fear of loss. The user can take
  their time; nothing is being threatened.

**How errors preserve dignity.** An error is a moment where a lesser product reveals
its contempt for the user — shouting, blaming, demanding. Gym Circle treats an error as
a chance to demonstrate the opposite: that it respects the user even when something
breaks. It stays calm, takes responsibility, explains plainly, and offers the next
step. Because absence is never punished and the user is always assumed capable, even
failure is met with warmth and a steady hand. The user should leave an error feeling
that the product had their back, not that it turned on them.

---

## Part 8 — Human Presence

Another person should be _felt_, never _broadcast_. This is the line between a circle
and a feed.

- **Never a feed.** Presence is not a scroll of everyone's activity. There is no
  timeline of who did what.
- **Never activity.** Presence is not a log of actions or a status board. It is not
  "here is everything that happened."
- **Never social media.** No follower counts, no public performance, no comparison, no
  reactions reduced to tallies.

**Presence should feel discovered, not announced.** The felt sense that the people in
your circle are still in the process with you should arrive quietly — surfaced at the
right moment, derived from real action, carrying a person and their words. It is the
difference between walking into a room and sensing someone you trust is there, versus
a billboard listing everyone's whereabouts.

**The emotional rules of witnessing:**

- Witnessing carries human words, never a count or a reaction icon. Support is
  recognition, not approval.
- Presence is derived from genuine action, never from chatter or check-ins.
- Another person's process is never shown as a yardstick for the user's own — no
  comparison, ever.
- Being seen is the mechanism; being ranked is forbidden. The feeling to produce is
  "I am not becoming this person alone," never "here is how I stack up."
- Presence respects privacy: a person is felt only by those their evidence was already
  visible to. Witnessing never exposes more than the relationship already permits.

---

## Part 9 — Future Compatibility

The interaction philosophy is a layer of _behavior_, not platform — so it survives
platform changes. Any future surface is tested against it, not the other way around:

- **Voice.** Fits only if it stays calm, brief, and unhurried — recognition spoken,
  never an assistant performing enthusiasm. A voice that hypes or nags fails Part 2.
- **AI.** Fits only if it reflects the user's own words and identity, never generating
  motivation or inferring feelings the user did not express (it would otherwise violate
  the memory documents and Principle 19). AI must serve recognition, never persuasion.
- **Wearables.** Fit only if they witness without nagging — presence and continuity on
  the wrist, never streak buzzes or guilt taps. A device that interrupts the body fails
  "nothing rushes / nothing blames."
- **Photos.** Fit only as the user's own evidence, private and witnessed by a few —
  never a gallery to perform or compare. Evidence, not content.
- **Coach.** Fits only as a calm presence that recognizes, never a drill sergeant that
  pushes. It speaks in `VOICE.md`'s register or it is not a Gym Circle coach.
- **Widgets.** Fit only as quiet reminders of who the user is becoming — the identity
  reflected at a glance — never a metric, a streak, or a count on the home screen.
- **Notifications.** Fit only if human and few, carrying a person and their words, never
  a tally or a daily guilt reminder. A notification that exists to drive an open fails
  the trust budget in `MEMORY_GOVERNANCE.md`.

**Why it survives platform changes.** Because it constrains _how things must feel_, not
_what device they run on_. Calm, certainty, warmth, dignity, continuity, and restraint
are demands any surface can meet or fail. New technology does not get a philosophical
exemption; it inherits the same behavior contract. The interaction system is therefore
forward-compatible by construction: it tells the next platform how to behave before
that platform exists.

---

## Part 10 — Final Verdict

- The **Product Bible** defines _why_.
- **Voice** defines _language_.
- **Principles** define _limits_.
- **Memory** defines _remembrance_.
- **Interaction** defines _behavior_.

Without interaction, philosophy stays invisible. A value no one can feel is just a
sentence in a document. The interaction system is where Gym Circle's beliefs become
tangible — where "remember who they are becoming; never count what they did" stops
being a principle and becomes the texture of every tap, pause, confirmation, and
silence. **Interaction is where values become real.**

The philosophy governs behavior; behavior governs implementation. Never the reverse.

---

## Reference Sources

- `PRODUCT_BIBLE.md` — why the product exists (highest source of truth); Part 7
  (design philosophy) is the emotional root of these behaviors.
- `VOICE.md` — how the product speaks; every word an interaction surfaces follows it.
- `PRINCIPLES.md` — the immutable product principles and never-build blacklist these
  behaviors enforce.
- `MEMORY_SELECTION_ENGINE.md` / `MEMORY_GOVERNANCE.md` — how memory feedback (Part 5)
  is selected and governed.
