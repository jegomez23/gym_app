import type { ReflectionType } from "@/lib/dal";
import type { HumanState } from "@/lib/state/deriveState";

/**
 * Memory Selection Engine (MEMORY_SELECTION_ENGINE.md) — the one decision: given a
 * person's own evidence, which single memory, if any, deserves to return right now?
 * Like the State Engine it is pure, deterministic, read-only, and explainable: it
 * only returns the user's own words, never generates them, and **silence is the
 * default output** (Governance Immutable 1).
 *
 * Selection Policy v1 surfaced a memory in exactly one context: the Quiet Return —
 * the single moment whose rarity is guaranteed by the gap itself, so it needs no
 * surfacing ledger (MEMORY_SELECTION_ENGINE.md Part 11).
 *
 * Selection Policy v2 adds one more context: the Profile, a *pull* surface. The user
 * navigated to their own mirror deliberately, so returning one of their oldest words
 * (their origin) is appropriate and — crucially — needs no Future Memory Ledger: the
 * ledger exists only to keep a *push* rare so it never becomes a notification hook
 * (Governance Immutable 6). A pull mirror is not a push; predictability on one's own
 * profile is fine and even good. This is why Phase 50's deferral (which cited the
 * ledger) was over-broad — the ledger gates pushes, not pulls. The everyday Today
 * *push* is still deliberately NOT built: justifying it as "a reason to open" is the
 * exact engagement mechanism Governance Decision-Framework Q4 / Immutable 6 forbid.
 */

/** Recency gate: very recent evidence is still present, not memory yet (Part 3). */
export const MEMORY_MIN_AGE_DAYS = 4;

/**
 * Origin gate for the Profile mirror: a memory must have earned real distance before
 * it reads as "where you started" rather than "what you just wrote". 30 days matches
 * the engine's own timeline (Part 9: "30 days — near-total silence; perhaps one
 * gentle reflection echo"). Conservative by design — silence stays the default.
 */
export const MEMORY_PROFILE_MIN_AGE_DAYS = 30;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type MemoryCandidate = {
  content: string;
  type: ReflectionType | null;
  createdAt: string;
};

export type MemoryReason =
  | "return-identity-reflection"
  | "return-reflection"
  | "profile-origin-identity"
  | "profile-origin-reflection";

export type SelectedMemory = {
  /** v1/v2 surface only the user's own reflection words. */
  kind: "reflection";
  content: string;
  /** Stable, auditable code for why this memory was chosen (Rule 9). */
  reason: MemoryReason;
  /** When the words were written — populated for the profile origin so the surface
      can show the distance traveled. Absent for the Quiet Return. */
  createdAt?: string;
};

export type MemoryEvidence = {
  /** Which surface is asking. "today" is push-restricted to the Quiet Return;
      "profile" is the pull mirror. Defaults to "today". */
  context?: "today" | "profile";
  /** The current human state, the today context gate's input. Unused for profile. */
  state?: HumanState;
  /** The user's own reflections (their words, their type) — the candidate pool. */
  reflections: MemoryCandidate[];
  /** The user's vow, excluded from a profile origin so memory never echoes the hero
      already shown on the mirror. */
  identityStatement?: string | null;
  /** Injectable for deterministic selection and tests. Defaults to now. */
  now?: Date;
};

function daysSince(value: string, now: number): number | null {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return null;
  }

  return Math.floor((now - then) / MS_PER_DAY);
}

// Oldest words win within a tier — age appreciates, "distance traveled" (Part 3),
// the opposite of a recency-ranked feed; the user is also likelier to have forgotten
// them, so they land harder (rarity).
const byOldest = (a: MemoryCandidate, b: MemoryCandidate) =>
  a.createdAt.localeCompare(b.createdAt);

/**
 * Select at most one memory to return, or null for silence. Faithful to the
 * deterministic hierarchy in MEMORY_SELECTION_ENGINE.md Part 5: the context gate
 * first, then the safety (harm) gate, then truth/recency, then category priority
 * (Identity ≻ Reflection), with age appreciating within a tier.
 */
export function selectMemory(evidence: MemoryEvidence): SelectedMemory | null {
  const now = (evidence.now ?? new Date()).getTime();

  if ((evidence.context ?? "today") === "profile") {
    return selectProfileMemory(evidence, now);
  }

  // Context gate (Rule 2): on Today, only the Quiet Return surfaces a memory (v1).
  if (evidence.state !== "returning") {
    return null;
  }

  const eligible = evidence.reflections.filter((reflection) => {
    if (!reflection.content.trim()) {
      return false;
    }

    // Safety gate (Rule 1 / Part 8): pain never surfaces casually at a return.
    if (reflection.type === "emotional") {
      return false;
    }

    // Truth/recency gate: a memory must be genuinely past, not what they just did.
    const age = daysSince(reflection.createdAt, now);
    return age !== null && age >= MEMORY_MIN_AGE_DAYS;
  });

  if (eligible.length === 0) {
    // Silence beats a weak memory (Rule 8). The most common, most trusted output.
    return null;
  }

  // Category priority (Rule 5): Identity ≻ Reflection.
  const identity = eligible
    .filter((reflection) => reflection.type === "identity")
    .sort(byOldest);
  const chosen = identity[0] ?? [...eligible].sort(byOldest)[0];

  return {
    kind: "reflection",
    content: chosen.content,
    reason:
      chosen.type === "identity"
        ? "return-identity-reflection"
        : "return-reflection",
  };
}

/**
 * The Profile origin (Selection Policy v2). A pull surface: return one of the user's
 * oldest words — their origin — so the mirror shows distance traveled, not what they
 * just wrote. Same gates as the Quiet Return (safety, truth/recency) but a longer
 * origin-age threshold, plus one extra: never echo the vow already shown on the hero.
 * Silence remains the default (Governance Immutable 1) — most profiles return null
 * until a reflection has aged into an origin.
 */
function selectProfileMemory(
  evidence: MemoryEvidence,
  now: number
): SelectedMemory | null {
  const vow = evidence.identityStatement?.trim() || null;

  const eligible = evidence.reflections.filter((reflection) => {
    if (!reflection.content.trim()) {
      return false;
    }

    // Safety gate (Rule 1 / Part 8): pain never surfaces casually.
    if (reflection.type === "emotional") {
      return false;
    }

    // Never echo the hero vow the mirror already shows (one memory at a time, Rule 7).
    if (vow && reflection.content.trim() === vow) {
      return false;
    }

    // Origin gate: the words must have earned real distance to read as a beginning.
    const age = daysSince(reflection.createdAt, now);
    return age !== null && age >= MEMORY_PROFILE_MIN_AGE_DAYS;
  });

  if (eligible.length === 0) {
    return null;
  }

  // Category priority (Rule 5): Identity ≻ Reflection; oldest within a tier.
  const identity = eligible
    .filter((reflection) => reflection.type === "identity")
    .sort(byOldest);
  const chosen = identity[0] ?? [...eligible].sort(byOldest)[0];

  return {
    kind: "reflection",
    content: chosen.content,
    reason:
      chosen.type === "identity"
        ? "profile-origin-identity"
        : "profile-origin-reflection",
    createdAt: chosen.createdAt,
  };
}
