import { describe, expect, it, vi } from "vitest";

import type { AuthContext, ProfileContext } from "./session";

vi.mock("server-only", () => ({}));

describe("authorization helpers", () => {
  it("allows owners and public commits", async () => {
    const { canViewCommit } = await import("./authorization");
    const viewer = {
      profile: { id: "profile-1", deletedAt: null },
    } as ProfileContext;

    expect(
      canViewCommit(viewer, { userId: "profile-1", visibility: "private" })
    ).toBe(true);
    expect(
      canViewCommit(viewer, { userId: "profile-2", visibility: "public" })
    ).toBe(true);
  });

  it("allows support only through active Circle membership", async () => {
    const { canSupport } = await import("./authorization");
    const context = {
      user: { id: "profile-1" },
      data: {
        services: {
          circle: {
            listCircle: vi.fn().mockResolvedValue([
              {
                circleUserId: "profile-2",
                status: "active",
                deletedAt: null,
              },
            ]),
          },
        },
      },
    } as unknown as AuthContext;

    await expect(canSupport(context, "profile-2")).resolves.toBe(true);
    await expect(canSupport(context, "profile-1")).resolves.toBe(false);
  });
});
