# Voice

Question: How does Gym Circle speak?

Last reviewed: 2026-06-23 (Phase 20 — Product Bible & Identity System)

Voice is not decoration. It is how the philosophy reaches the user. A single
wrong word can turn an identity product into a tracker. This document is canon;
when in doubt about any user-facing words, it wins. It serves
`PRODUCT_BIBLE.md`.

---

## Tone

Gym Circle speaks the way a trusted person speaks to you when you are trying to
change your life and do not want to be cheered at. Calm. Certain. Warm without
sentimentality. It never raises its voice, never performs enthusiasm, and never
flatters. It assumes the user is serious, capable, and worthy of being spoken to
plainly.

The voice is closer to a good coach at rest than to a brand. It does not sell.
It does not hype. It does not motivate with pressure. It recognizes.

---

## Voice principles

- **Speak to the person, not the behavior.** We address who they are becoming,
  not what they completed.
- **Recognize, never praise.** "You showed up" is recognition. "Great job!" is
  praise. We do the first.
- **Be brief.** The user came to live their life, not read ours. Few words,
  chosen well. Silence is allowed and often better.
- **Never use pressure, guilt, or urgency.** No countdowns, no "don't lose it,"
  no "you're falling behind." Ever.
- **Hold the door, never push through it.** Invitations, not commands.
- **Name feeling honestly, not theatrically.** Real warmth, no exclamation
  marks, no manufactured delight.
- **Let the user's own words outrank ours.** A resurfaced reflection is stronger
  than anything we could write. Get out of the way.

---

## Words we use

becoming, showing up, evidence, proof, presence, witnessed, seen, return,
foundation, continuity, quiet, honest, identity, the person you're becoming,
this is who you are being.

These words point at identity, recognition, and belonging.

## Words we avoid

streak, score, points, XP, rank, leaderboard, level, goal, target, crush, smash,
beast, grind, no excuses, don't break the chain, you're falling behind, keep your
streak alive, daily reminder, complete, finished, winner, loser, fail, missed
(as accusation).

These words point at measurement, competition, pressure, or shame. Each one
quietly turns the product into something we refuse to be.

---

## Sentence rhythm

Short. Plain. One idea per line. The cadence should feel like breathing out, not
like being sold to. Prefer a calm full stop over an excited clause. When a
sentence can lose a word without losing meaning, lose the word.

Good rhythm: "Quedó registrado. Apareciste."

Bad rhythm: "Awesome work today — you're absolutely crushing it, keep that streak
going strong!! 🔥"

---

## Microcopy rules

- **Empty states** are invitations. They begin a story; they never report an
  absence. ("Tu primera evidencia empieza aquí." — not "No tienes datos.")
- **Success** names the person. ("Apareciste." — not "Sesión guardada con
  éxito.")
- **Errors** stay calm and offer a way back. They never blame. ("No pudimos
  cargar esto. Intenta de nuevo." — not "Error: request failed.")
- **Return after absence** is always warm and continuous. ("La base sigue ahí." —
  never "Llevas 6 días sin entrar.")
- **Notifications** are human and few. They carry a person and their words, not a
  count or a status. ("Te vieron hoy." — not "Tienes 3 notificaciones nuevas.")
- **Numbers** are never the headline. If a number must appear, it serves a
  sentence about the person; it is never the sentence itself.

---

## Examples

| Good                                           | Bad                           | Why                                          |
| ---------------------------------------------- | ----------------------------- | -------------------------------------------- |
| "Apareciste."                                  | "¡Sesión completada! 🎉"      | Recognizes identity vs. celebrates a task.   |
| "La base sigue ahí. Bienvenido."               | "Llevas 5 días sin aparecer." | Welcomes the return vs. accuses the absence. |
| "Te vieron hoy."                               | "1 nueva interacción"         | Human and warm vs. administrative.           |
| "Una prueba más de quién estás eligiendo ser." | "+1 commit esta semana"       | Evidence of identity vs. a count.            |
| "Tu primera evidencia empieza aquí."           | "Aún no hay actividad."       | Invitation vs. report of emptiness.          |

---

## On the word "Commit"

"Commit" is the internal domain term for the atomic record of showing up. It is
precise, it maps cleanly to the data model, and engineers should keep using it in
code, types, and documentation. (See `DOMAIN.md`.)

But "Commit" is engineering language, not human language. To a user trying to
change their life, "register a commit" sounds like a task in a tool. The
interface therefore speaks differently — in the language of showing up, evidence,
and becoming — even while the system underneath calls it a Commit.

This separation is intentional and permanent: **the domain may keep its precise
nouns; the interface must speak the user's emotional language.** When the two
ever seem to conflict, the user-facing words follow this document, and the code
follows `DOMAIN.md`. Neither has to change the other.
