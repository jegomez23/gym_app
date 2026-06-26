import { describe, expect, it } from "vitest";

import { activityKindLabel } from "./activityKinds";

describe("activityKindLabel", () => {
  it("labels a current movement kind in the product vocabulary", () => {
    expect(activityKindLabel("run")).toBe("Correr");
    expect(activityKindLabel("hike")).toBe("Montaña");
  });

  it("still labels a legacy kind so no past evidence is orphaned", () => {
    expect(activityKindLabel("cardio")).toBe("Cardio");
    expect(activityKindLabel("recovery")).toBe("Recuperación");
  });

  it("returns silence (null) rather than echo a raw machine key", () => {
    expect(activityKindLabel("crossfit")).toBeNull();
    expect(activityKindLabel("")).toBeNull();
    expect(activityKindLabel(null)).toBeNull();
    expect(activityKindLabel(undefined)).toBeNull();
  });
});
