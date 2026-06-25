import { describe, expect, it } from "vitest";

import { describeCadence } from "./describeCadence";

const NOW = new Date("2026-06-25T12:00:00.000Z");

function daysAgo(days: number) {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe("describeCadence", () => {
  it("stays silent with no first commit", () => {
    expect(
      describeCadence({
        totalCommits: 10,
        activeDays: 10,
        firstCommitAt: null,
        now: NOW,
      })
    ).toBeNull();
  });

  it("stays silent below the minimum number of commits", () => {
    expect(
      describeCadence({
        totalCommits: 2,
        activeDays: 2,
        firstCommitAt: daysAgo(30),
        now: NOW,
      })
    ).toBeNull();
  });

  it("stays silent before a weekly rhythm can be claimed honestly", () => {
    expect(
      describeCadence({
        totalCommits: 5,
        activeDays: 5,
        firstCommitAt: daysAgo(10),
        now: NOW,
      })
    ).toBeNull();
  });

  it("describes a near-daily practice", () => {
    expect(
      describeCadence({
        totalCommits: 26,
        activeDays: 26,
        firstCommitAt: daysAgo(28),
        now: NOW,
      })
    ).toBe("Has estado apareciendo casi a diario.");
  });

  it("describes about three times a week", () => {
    // 12 active days over 4 weeks → 3/week.
    expect(
      describeCadence({
        totalCommits: 18,
        activeDays: 12,
        firstCommitAt: daysAgo(28),
        now: NOW,
      })
    ).toBe("Has estado apareciendo unas tres veces por semana.");
  });

  it("counts active days, not total commits, so a busy day never inflates rhythm", () => {
    // 30 commits but only 4 distinct days over 4 weeks → ~1/week, not near-daily.
    expect(
      describeCadence({
        totalCommits: 30,
        activeDays: 4,
        firstCommitAt: daysAgo(28),
        now: NOW,
      })
    ).toBe("Has estado apareciendo casi cada semana.");
  });

  it("describes a sparse practice without punishing it", () => {
    // 3 active days over 12 weeks → well under once a week.
    expect(
      describeCadence({
        totalCommits: 3,
        activeDays: 3,
        firstCommitAt: daysAgo(84),
        now: NOW,
      })
    ).toBe("Has estado apareciendo a tu propio ritmo.");
  });
});
