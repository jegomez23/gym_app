import type { ReflectionType } from "@/lib/dal";
import type { HumanState } from "@/lib/state/deriveState";

/**
 * Memory Selection Engine (MEMORY_SELECTION_ENGINE.md) — the one decision: given a
 * person's own evidence, which single memory, if any, deserves to return right now?
 * Like the State Engine it is pure, deterministic, read-only, and explainable: it
 * only returns the user's own words, never generates them, and **silence is the
 * default output** (Governance Immutable 1).
 *
 * v1 deliberately surfaces a memory in exactly one context: the Quiet Return. That
 * is the single moment whose rarity is guaranteed by the gap itself, so it needs no
 * surfacing ledger to prevent repetition. Every other context returns silence here
 * until the Future Memory Ledger exists to enforce cooldown/rarity across opens
 * (MEMORY_SELECTION_ENGINE.md Part 11). Surfacing on a normal open without it would
 * become wallpaper and break Immutable 1 — so it is intentionally not done.
 */

/** Recency gate: very recent evidence is still present, not memory yet (Part 3). */
export const MEMORY_MIN_AGE_DAYS = 4;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type MemoryCandidate = {
  content: string;
  type: ReflectionType | null;
  createdAt: string;
};

export type MemoryReason = "return-identity-reflection" | "return-reflection";

export type SelectedMemory = {
  /** v1 surfaces only the user's own reflection words. */
  kind: "reflection";
  content: string;
  /** Stable, auditable code for why this memory was chosen (Rule 9). */
  reason: MemoryReason;
};

export type MemoryEvidence = {
  /** The current human state, the context gate's input. */
  state: HumanState;
  /** The user's own reflections (their words, their type) — the candidate pool. */
  reflections: MemoryCandidate[];
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

/**
 * Select at most one memory to return, or null for silence. Faithful to the
 * deterministic hierarchy in MEMORY_SELECTION_ENGINE.md Part 5: the context gate
 * first, then the safety (harm) gate, then truth/recency, then category priority
 * (Identity ≻ Reflection), with age appreciating within a tier.
 */
export function selectMemory(evidence: MemoryEvidence): SelectedMemory | null {
  // Context gate (Rule 2): only the Quiet Return surfaces a memory in v1.
  if (evidence.state !== "returning") {
    return null;
  }

  const now = (evidence.now ?? new Date()).getTime();

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

  // Oldest words win within a tier — age appreciates, "distance traveled" (Part 3),
  // the opposite of a recency-ranked feed; the user is also likelier to have
  // forgotten them, so they land harder (rarity).
  const byOldest = (a: MemoryCandidate, b: MemoryCandidate) =>
    a.createdAt.localeCompare(b.createdAt);

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
