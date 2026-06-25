/**
 * Cadence — the smallest honest expression that a practice has a rhythm
 * (Phase 41, "process, not performance"). It is NOT a statistic, a streak, a
 * goal, or a record. It answers one question — "what does this evidence quietly
 * reveal about their process?" — and answers it in words, never a raw number.
 *
 * Like deriveState and selectMemory it is pure, deterministic, explainable, and
 * defaults to silence: when the evidence cannot honestly describe a weekly rhythm
 * yet, it returns null. A practice with almost no history has no cadence to claim,
 * and saying nothing is more truthful than inventing a number.
 *
 * It reads only evidence the user already created (commits, the days they showed
 * up, when they began). No new persistence. Cadence is counted in *active days*,
 * not total commits, so showing up many times in one day never inflates a rhythm.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Below this many commits there is no practice to describe — only a beginning. */
export const CADENCE_MIN_COMMITS = 3;
/** Below this span a "weekly" rhythm cannot be claimed honestly. */
export const CADENCE_MIN_DAYS = 14;

export type CadenceEvidence = {
  totalCommits: number;
  /** Distinct days the user showed up — the true denominator of a rhythm. */
  activeDays: number;
  firstCommitAt: string | null;
  /** Injectable for deterministic derivation and tests. Defaults to now. */
  now?: Date;
};

/**
 * Describe the user's practice rhythm in plain words, or return null (silence)
 * when there is not enough evidence to do so honestly. The phrasing is always
 * approximate and never punishing — a personal cadence, never a score to beat.
 */
export function describeCadence(evidence: CadenceEvidence): string | null {
  if (!evidence.firstCommitAt || evidence.totalCommits < CADENCE_MIN_COMMITS) {
    return null;
  }

  const start = new Date(evidence.firstCommitAt).getTime();
  if (Number.isNaN(start)) {
    return null;
  }

  const now = (evidence.now ?? new Date()).getTime();
  const spanDays = Math.floor((now - start) / MS_PER_DAY);
  if (spanDays < CADENCE_MIN_DAYS) {
    return null;
  }

  const weeks = Math.max(spanDays / 7, 1);
  const perWeek = evidence.activeDays / weeks;

  // Soft buckets, understanding over precision. Never an exact figure as a headline.
  if (perWeek >= 5.5) {
    return "Has estado apareciendo casi a diario.";
  }
  if (perWeek >= 3.5) {
    return "Has estado apareciendo varias veces por semana.";
  }
  if (perWeek >= 2.5) {
    return "Has estado apareciendo unas tres veces por semana.";
  }
  if (perWeek >= 1.5) {
    return "Has estado apareciendo un par de veces por semana.";
  }
  if (perWeek >= 0.75) {
    return "Has estado apareciendo casi cada semana.";
  }
  // Sparse, but never framed as failure: the door stays open at any pace.
  return "Has estado apareciendo a tu propio ritmo.";
}
