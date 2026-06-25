import { describe, expect, it } from "vitest";

import { selectMemory, type MemoryCandidate } from "./selectMemory";

const NOW = new Date("2026-06-25T12:00:00.000Z");

function daysAgo(days: number) {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

const oldIdentity: MemoryCandidate = {
  content: "Soy alguien que aparece, incluso cuando es difícil.",
  type: "identity",
  createdAt: daysAgo(40),
};

const oldProcess: MemoryCandidate = {
  content: "Empecé por lo más simple y funcionó.",
  type: "process",
  createdAt: daysAgo(20),
};

describe("selectMemory", () => {
  it("returns silence outside the Quiet Return context", () => {
    expect(
      selectMemory({ state: "building", reflections: [oldIdentity], now: NOW })
    ).toBeNull();
    expect(
      selectMemory({ state: "beginning", reflections: [oldIdentity], now: NOW })
    ).toBeNull();
  });

  it("returns silence when there are no eligible reflections", () => {
    expect(
      selectMemory({ state: "returning", reflections: [], now: NOW })
    ).toBeNull();
  });

  it("never surfaces an emotional reflection casually (safety gate)", () => {
    const emotional: MemoryCandidate = {
      content: "Fue un día muy duro.",
      type: "emotional",
      createdAt: daysAgo(30),
    };
    expect(
      selectMemory({ state: "returning", reflections: [emotional], now: NOW })
    ).toBeNull();
  });

  it("never surfaces a reflection that is too recent to be memory yet", () => {
    const recent: MemoryCandidate = {
      content: "Apenas ayer.",
      type: "identity",
      createdAt: daysAgo(1),
    };
    expect(
      selectMemory({ state: "returning", reflections: [recent], now: NOW })
    ).toBeNull();
  });

  it("returns the user's own words on a Quiet Return", () => {
    const result = selectMemory({
      state: "returning",
      reflections: [oldProcess],
      now: NOW,
    });
    expect(result).toEqual({
      kind: "reflection",
      content: oldProcess.content,
      reason: "return-reflection",
    });
  });

  it("prefers an identity reflection over other types (category priority)", () => {
    const result = selectMemory({
      state: "returning",
      reflections: [oldProcess, oldIdentity],
      now: NOW,
    });
    expect(result?.content).toBe(oldIdentity.content);
    expect(result?.reason).toBe("return-identity-reflection");
  });

  it("prefers the oldest words within a tier (age appreciates)", () => {
    const newerIdentity: MemoryCandidate = {
      content: "Palabras más nuevas.",
      type: "identity",
      createdAt: daysAgo(10),
    };
    const result = selectMemory({
      state: "returning",
      reflections: [newerIdentity, oldIdentity],
      now: NOW,
    });
    expect(result?.content).toBe(oldIdentity.content);
  });
});
