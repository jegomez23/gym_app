import { describe, expect, it } from "vitest";

import {
  deriveSharedPresence,
  type SharedPresenceProposal,
} from "./deriveSharedPresence";

const NOW = new Date("2026-06-25T18:00:00.000Z");

function hoursAgo(hours: number) {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function proposal(
  overrides: Partial<SharedPresenceProposal> = {}
): SharedPresenceProposal {
  return {
    notificationId: "n1",
    partnerId: "ana",
    partnerName: "Ana",
    accepted: false,
    createdAt: hoursAgo(2),
    ...overrides,
  };
}

describe("deriveSharedPresence", () => {
  it("surfaces an unaccepted proposal as pending", () => {
    const result = deriveSharedPresence({
      proposals: [proposal()],
      selfLastCommitAt: null,
      partnerLastCommitAt: {},
      now: NOW,
    });

    expect(result.pending).toEqual([
      { notificationId: "n1", partnerId: "ana", partnerName: "Ana" },
    ]);
    expect(result.active).toEqual([]);
  });

  it("expires proposals older than the window — never failed, just gone", () => {
    const result = deriveSharedPresence({
      proposals: [proposal({ accepted: true, createdAt: hoursAgo(48) })],
      selfLastCommitAt: hoursAgo(1),
      partnerLastCommitAt: { ana: hoursAgo(1) },
      now: NOW,
    });

    expect(result.pending).toEqual([]);
    expect(result.active).toEqual([]);
  });

  it("waits when an accepted pact has no evidence yet", () => {
    const result = deriveSharedPresence({
      proposals: [proposal({ accepted: true, createdAt: hoursAgo(3) })],
      selfLastCommitAt: hoursAgo(10),
      partnerLastCommitAt: { ana: hoursAgo(10) },
      now: NOW,
    });

    expect(result.active).toHaveLength(1);
    expect(result.active[0].status).toBe("waiting");
  });

  it("is 'almost' when only one of the two has appeared", () => {
    const result = deriveSharedPresence({
      proposals: [proposal({ accepted: true, createdAt: hoursAgo(3) })],
      selfLastCommitAt: hoursAgo(1),
      partnerLastCommitAt: { ana: hoursAgo(10) },
      now: NOW,
    });

    expect(result.active[0]).toMatchObject({
      status: "almost",
      selfAppeared: true,
      partnerAppeared: false,
    });
  });

  it("resolves to 'together' once both appeared after the pact began", () => {
    const result = deriveSharedPresence({
      proposals: [proposal({ accepted: true, createdAt: hoursAgo(3) })],
      selfLastCommitAt: hoursAgo(1),
      partnerLastCommitAt: { ana: hoursAgo(2) },
      now: NOW,
    });

    expect(result.active[0].status).toBe("together");
  });

  it("does not count commits left before the pact began", () => {
    const result = deriveSharedPresence({
      proposals: [proposal({ accepted: true, createdAt: hoursAgo(3) })],
      // Both committed 5h ago — before the 3h-old pact. Not togetherness.
      selfLastCommitAt: hoursAgo(5),
      partnerLastCommitAt: { ana: hoursAgo(5) },
      now: NOW,
    });

    expect(result.active[0].status).toBe("waiting");
  });
});
