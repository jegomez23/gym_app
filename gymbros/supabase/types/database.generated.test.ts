import { describe, expect, it } from "vitest";

import type { Database, Tables } from "./database.generated";

describe("generated database types", () => {
  it("tracks canonical MVP table names", () => {
    const tableNames = [
      "profiles",
      "commits",
      "reflections",
      "circle_memberships",
      "supports",
      "notifications",
    ] satisfies Array<keyof Database["public"]["Tables"]>;

    expect(tableNames).toHaveLength(6);
  });

  it("keeps persistence enums aligned with the data contract", () => {
    const profileUsername: Tables<"profiles">["username"] = "dia";
    const commitVisibility: Tables<"commits">["visibility"] = "circle";
    const reflectionVisibility: Tables<"reflections">["visibility"] = "private";
    const membershipStatus: Tables<"circle_memberships">["status"] = "pending";
    const notificationType: Tables<"notifications">["type"] =
      "support_received";

    expect(profileUsername).toBe("dia");
    expect(commitVisibility).toBe("circle");
    expect(reflectionVisibility).toBe("private");
    expect(membershipStatus).toBe("pending");
    expect(notificationType).toBe("support_received");
  });
});
