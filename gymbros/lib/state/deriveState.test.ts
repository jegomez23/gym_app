import { describe, expect, it } from "vitest";

import {
  PROTECTED_WINDOW_DAYS,
  RETURN_AFTER_DAYS,
  deriveState,
  type StateEvidence,
} from "./deriveState";

const NOW = new Date("2026-06-25T12:00:00.000Z");

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function evidence(overrides: Partial<StateEvidence> = {}): StateEvidence {
  return {
    totalCommits: 5,
    lastCommitAt: daysAgo(0),
    latestReflection: null,
    latestSupportReceivedAt: null,
    now: NOW,
    ...overrides,
  };
}

describe("deriveState", () => {
  it("returns beginning when there is no evidence yet", () => {
    const result = deriveState(
      evidence({ totalCommits: 0, lastCommitAt: null })
    );

    expect(result.state).toBe("beginning");
    expect(result.reason).toBe("no-evidence-yet");
    expect(result.gapDays).toBeNull();
  });

  it("returns building for someone showing up with continuity", () => {
    const result = deriveState(evidence({ lastCommitAt: daysAgo(0) }));

    expect(result.state).toBe("building");
    expect(result.reason).toBe("showing-up-with-continuity");
    expect(result.gapDays).toBe(0);
  });

  it("returns resting for a short pause, not a lapse", () => {
    const result = deriveState(evidence({ lastCommitAt: daysAgo(2) }));

    expect(result.state).toBe("resting");
    expect(result.reason).toBe("pause-since-last-commit");
    expect(result.gapDays).toBe(2);
  });

  it("returns returning after a real gap", () => {
    const result = deriveState(
      evidence({ lastCommitAt: daysAgo(RETURN_AFTER_DAYS) })
    );

    expect(result.state).toBe("returning");
    expect(result.reason).toBe("gap-since-last-commit");
    expect(result.gapDays).toBe(RETURN_AFTER_DAYS);
  });

  it("returns supported when a human word arrived recently", () => {
    const result = deriveState(
      evidence({ latestSupportReceivedAt: daysAgo(1) })
    );

    expect(result.state).toBe("supported");
    expect(result.reason).toBe("support-received-recently");
  });

  it("returns protected from the user's own recent emotional reflection", () => {
    const result = deriveState(
      evidence({
        latestReflection: { type: "emotional", createdAt: daysAgo(1) },
      })
    );

    expect(result.state).toBe("protected");
    expect(result.reason).toBe("recent-emotional-reflection");
  });

  it("does not enter protected from a non-emotional reflection", () => {
    const result = deriveState(
      evidence({
        latestReflection: { type: "process", createdAt: daysAgo(1) },
      })
    );

    expect(result.state).toBe("building");
  });

  it("exits protected once the emotional reflection ages out of the window", () => {
    const result = deriveState(
      evidence({
        latestReflection: {
          type: "emotional",
          createdAt: daysAgo(PROTECTED_WINDOW_DAYS + 1),
        },
      })
    );

    expect(result.state).not.toBe("protected");
  });

  it("prioritizes protected over a returning gap", () => {
    const result = deriveState(
      evidence({
        lastCommitAt: daysAgo(10),
        latestReflection: { type: "emotional", createdAt: daysAgo(1) },
      })
    );

    expect(result.state).toBe("protected");
  });

  it("prioritizes returning over a recent support (the sacred arrival wins)", () => {
    const result = deriveState(
      evidence({
        lastCommitAt: daysAgo(10),
        latestSupportReceivedAt: daysAgo(1),
      })
    );

    expect(result.state).toBe("returning");
  });

  it("prioritizes support over the resting default when there is no gap", () => {
    const result = deriveState(
      evidence({
        lastCommitAt: daysAgo(0),
        latestSupportReceivedAt: daysAgo(1),
      })
    );

    expect(result.state).toBe("supported");
  });

  it("ignores stale support outside the recency window", () => {
    const result = deriveState(
      evidence({
        lastCommitAt: daysAgo(0),
        latestSupportReceivedAt: daysAgo(5),
      })
    );

    expect(result.state).toBe("building");
  });

  it("is deterministic: same evidence always yields the same state", () => {
    const input = evidence({ lastCommitAt: daysAgo(3) });

    expect(deriveState(input)).toEqual(deriveState(input));
  });

  it("tolerates an invalid date without throwing", () => {
    const result = deriveState(
      evidence({ totalCommits: 0, lastCommitAt: "not-a-date" })
    );

    expect(result.state).toBe("beginning");
    expect(result.gapDays).toBeNull();
  });
});
