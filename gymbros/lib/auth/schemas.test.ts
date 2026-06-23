import { describe, expect, it } from "vitest";

import {
  onboardingProfileSchema,
  reservedUsernames,
  resetPasswordSchema,
  signUpSchema,
} from "./schemas";

describe("auth validation schemas", () => {
  it("validates signup credentials and normalizes email", () => {
    const parsed = signUpSchema.parse({
      email: " DIA@EXAMPLE.COM ",
      password: "quiet-passphrase",
      name: "Dia",
    });

    expect(parsed.email).toBe("dia@example.com");
  });

  it("rejects reserved usernames during onboarding", () => {
    expect(reservedUsernames.has("admin")).toBe(true);
    expect(() =>
      onboardingProfileSchema.parse({
        username: "admin",
        name: "Dia",
        timezone: "Europe/Madrid",
        locale: "es",
      })
    ).toThrow();
  });

  it("requires matching reset passwords", () => {
    expect(() =>
      resetPasswordSchema.parse({
        password: "quiet-passphrase",
        confirmPassword: "different-passphrase",
      })
    ).toThrow();
  });
});
