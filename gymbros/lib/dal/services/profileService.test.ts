import { describe, expect, it, vi } from "vitest";

import type { Profile } from "../types";
import { ProfileService } from "./profileService";

const userId = "00000000-0000-0000-0000-000000000001";

const profile: Profile = {
  id: userId,
  username: "dia",
  name: "Dia",
  avatarUrl: null,
  bio: null,
  visibilityPreference: "circle",
  onboardingCompleted: true,
  timezone: "UTC",
  locale: "en",
  createdAt: "2026-06-22T08:00:00.000Z",
  updatedAt: "2026-06-22T08:00:00.000Z",
  deletedAt: null,
};

function createService() {
  const profiles = {
    findProfile: vi.fn().mockResolvedValue(profile),
    createProfile: vi.fn().mockResolvedValue(profile),
    findProfileByUsername: vi.fn().mockResolvedValue(profile),
    listProfilesByIds: vi.fn().mockResolvedValue([profile]),
    updateProfile: vi.fn().mockResolvedValue(profile),
  };
  return { profiles, service: new ProfileService(profiles) };
}

describe("ProfileService", () => {
  it("delegates findProfile to repository", async () => {
    const { profiles, service } = createService();

    await expect(service.findProfile(userId)).resolves.toEqual(profile);
    expect(profiles.findProfile).toHaveBeenCalledWith(userId);
  });

  it("delegates updateProfile to repository", async () => {
    const { profiles, service } = createService();
    const input = { name: "New Name" };

    await service.updateProfile(userId, input);

    expect(profiles.updateProfile).toHaveBeenCalledWith(userId, input);
  });

  it("completeOnboarding sets onboardingCompleted true and clears deletedAt", async () => {
    const { profiles, service } = createService();
    const input = {
      username: "dia",
      name: "Dia",
      timezone: "UTC",
      locale: "en",
    };

    await service.completeOnboarding(userId, input);

    expect(profiles.updateProfile).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        onboardingCompleted: true,
        deletedAt: null,
      })
    );
  });

  it("completeOnboarding passes through all provided fields", async () => {
    const { profiles, service } = createService();
    const input = {
      username: "dia",
      name: "Dia",
      bio: "Entreno en silencio.",
      timezone: "America/Bogota",
      locale: "es",
    };

    await service.completeOnboarding(userId, input);

    expect(profiles.updateProfile).toHaveBeenCalledWith(
      userId,
      expect.objectContaining(input)
    );
  });

  it("softDeleteProfile sets deletedAt to a non-null ISO string", async () => {
    const { profiles, service } = createService();

    await service.softDeleteProfile(userId);

    expect(profiles.updateProfile).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        deletedAt: expect.any(String),
      })
    );

    const call = profiles.updateProfile.mock.calls[0][1] as {
      deletedAt: string;
    };
    expect(() => new Date(call.deletedAt)).not.toThrow();
  });
});
