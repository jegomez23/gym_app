import { describe, expect, it } from "vitest";

import {
  createReflectionSchema,
  publishCommitSchema,
  sendSupportSchema,
} from "./schemas";

describe("DAL schemas", () => {
  it("normalizes optional commit fields for persistence", () => {
    const parsed = publishCommitSchema.parse({
      title: "  Lower body restart  ",
      visibility: "circle",
    });

    expect(parsed).toMatchObject({
      title: "Lower body restart",
      visibility: "circle",
      evidence: [],
    });
  });

  it("rejects reflections without a valid commit id", () => {
    expect(() =>
      createReflectionSchema.parse({
        commitId: "not-a-uuid",
        content: "Small promises count.",
      })
    ).toThrow();
  });

  it("keeps Support verbal and bounded", () => {
    expect(() =>
      sendSupportSchema.parse({
        toUserId: "00000000-0000-0000-0000-000000000002",
        message: "",
      })
    ).toThrow();
  });
});
