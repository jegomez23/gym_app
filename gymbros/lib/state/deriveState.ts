import type { ReflectionType } from "@/lib/dal";

/**
 * State Engine — the single canonical place where a person's human state is
 * derived (STATE_SYSTEM.md). It is pure, deterministic, read-only, and
 * explainable: every result carries the evidence reason that produced it.
 *
 * It never infers feelings, never predicts, never classifies a person. It only
 * reads evidence the user already created (commits, their own reflections,
 * supports received). If a state would require guessing, it is not derived here
 * (STATE_SYSTEM.md Part 9).
 *
 * Thresholds live here, never inside components. RETURN_AFTER_DAYS preserves the
 * 4-day boundary previously inlined in TodayScreen.
 */

export const REST_AFTER_DAYS = 2;
export const RETURN_AFTER_DAYS = 4;
export const PROTECTED_WINDOW_DAYS = 7;
export const SUPPORT_RECENT_DAYS = 2;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * The subset of canonical states v1 can derive from existing evidence without
 * inference. Witnessed, Reflecting, Waiting, Alone, and Transitioning are
 * intentionally not emitted yet — they require signals the substrate does not
 * track (a "seen" event, a live writing moment, a pending-response marker, an
 * identity-statement history) and the constitution forbids guessing them.
 */
export type HumanState =
  | "beginning"
  | "building"
  | "returning"
  | "protected"
  | "supported"
  | "resting";

export type StateReason =
  | "no-evidence-yet"
  | "recent-emotional-reflection"
  | "gap-since-last-commit"
  | "support-received-recently"
  | "pause-since-last-commit"
  | "showing-up-with-continuity";

export type DerivedState = {
  state: HumanState;
  /** Stable, auditable code for why this state was chosen (explainability). */
  reason: StateReason;
  /** Whole days since the last commit, or null when there is none. */
  gapDays: number | null;
};

export type StateEvidence = {
  totalCommits: number;
  lastCommitAt: string | null;
  /** The user's most recent reflection (their own words, their own type). */
  latestReflection: { type: ReflectionType | null; createdAt: string } | null;
  /** When the user most recently received a human word from their circle. */
  latestSupportReceivedAt: string | null;
  /** Injectable for deterministic derivation and tests. Defaults to now. */
  now?: Date;
};

function daysSince(value: string | null, now: number): number | null {
  if (!value) {
    return null;
  }

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return null;
  }

  return Math.floor((now - then) / MS_PER_DAY);
}

/**
 * Derive the person's current state from evidence. Priority is deterministic and
 * follows STATE_SYSTEM.md Part 5: Protected ≻ Returning ≻ Supported ≻ Beginning
 * ≻ Resting ≻ Building. The first matching branch wins.
 */
export function deriveState(evidence: StateEvidence): DerivedState {
  const now = (evidence.now ?? new Date()).getTime();
  const gapDays = daysSince(evidence.lastCommitAt, now);

  // 1. Protected — the user's own recent emotional reflection. Reverence above
  //    all. Entered only from evidence the user wrote, never inferred.
  const reflectionAge = evidence.latestReflection
    ? daysSince(evidence.latestReflection.createdAt, now)
    : null;
  if (
    evidence.latestReflection?.type === "emotional" &&
    reflectionAge !== null &&
    reflectionAge <= PROTECTED_WINDOW_DAYS
  ) {
    return {
      state: "protected",
      reason: "recent-emotional-reflection",
      gapDays,
    };
  }

  // 2. Returning — came back after a real gap. The sacred arrival.
  if (
    evidence.totalCommits > 0 &&
    gapDays !== null &&
    gapDays >= RETURN_AFTER_DAYS
  ) {
    return { state: "returning", reason: "gap-since-last-commit", gapDays };
  }

  // 3. Supported — a human word arrived recently. People outrank everything below.
  const supportAge = daysSince(evidence.latestSupportReceivedAt, now);
  if (supportAge !== null && supportAge <= SUPPORT_RECENT_DAYS) {
    return {
      state: "supported",
      reason: "support-received-recently",
      gapDays,
    };
  }

  // 4. Beginning — no evidence yet. Nothing to remember.
  if (evidence.totalCommits === 0) {
    return { state: "beginning", reason: "no-evidence-yet", gapDays };
  }

  // 5. Resting — a pause, not a lapse. Held, never punished.
  if (gapDays !== null && gapDays >= REST_AFTER_DAYS) {
    return { state: "resting", reason: "pause-since-last-commit", gapDays };
  }

  // 6. Building — the steady default.
  return { state: "building", reason: "showing-up-with-continuity", gapDays };
}
