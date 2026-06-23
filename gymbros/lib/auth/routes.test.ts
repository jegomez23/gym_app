import { describe, expect, it } from "vitest";

import {
  authRoutes,
  isRouteMatch,
  privateRoutes,
  safeReturnTo,
} from "./routes";

describe("auth route helpers", () => {
  it("matches exact routes and nested route segments", () => {
    expect(isRouteMatch("/commit", privateRoutes)).toBe(true);
    expect(isRouteMatch("/commit/details", privateRoutes)).toBe(true);
    expect(isRouteMatch("/committed", privateRoutes)).toBe(false);
  });

  it("keeps return URLs internal and out of auth entry loops", () => {
    expect(safeReturnTo("/archive")).toBe("/archive");
    expect(safeReturnTo("//evil.test")).toBe("/");
    expect(safeReturnTo("https://evil.test")).toBe("/");
    expect(safeReturnTo("/login")).toBe("/");
  });

  it("does not treat reset password as an auth-entry redirect route", () => {
    expect(isRouteMatch("/reset-password", authRoutes)).toBe(false);
  });
});
