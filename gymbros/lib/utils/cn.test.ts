import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins only truthy class names", () => {
    expect(cn("base", false, undefined, "active")).toBe("base active");
  });
});
