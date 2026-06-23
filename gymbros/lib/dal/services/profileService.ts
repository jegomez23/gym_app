import type { CreateProfileInput, UpdateProfileInput } from "../schemas";
import type { Profile } from "../types";

type ProfileDataAccess = {
  findProfile(profileId: string): Promise<Profile>;
  createProfile(input: CreateProfileInput): Promise<Profile>;
  findProfileByUsername(username: string): Promise<Profile | null>;
  listProfilesByIds(profileIds: string[]): Promise<Profile[]>;
  updateProfile(profileId: string, input: UpdateProfileInput): Promise<Profile>;
};

export class ProfileService {
  constructor(private readonly profiles: ProfileDataAccess) {}

  findProfile(profileId: string): Promise<Profile> {
    return this.profiles.findProfile(profileId);
  }

  createProfile(input: CreateProfileInput): Promise<Profile> {
    return this.profiles.createProfile(input);
  }

  findProfileByUsername(username: string): Promise<Profile | null> {
    return this.profiles.findProfileByUsername(username);
  }

  listProfilesByIds(profileIds: string[]): Promise<Profile[]> {
    return this.profiles.listProfilesByIds(profileIds);
  }

  updateProfile(
    profileId: string,
    input: UpdateProfileInput
  ): Promise<Profile> {
    return this.profiles.updateProfile(profileId, input);
  }

  async completeOnboarding(
    profileId: string,
    input: Omit<CreateProfileInput, "id" | "onboardingCompleted">
  ): Promise<Profile> {
    return this.profiles.updateProfile(profileId, {
      ...input,
      onboardingCompleted: true,
      deletedAt: null,
    });
  }

  softDeleteProfile(profileId: string): Promise<Profile> {
    return this.profiles.updateProfile(profileId, {
      deletedAt: new Date().toISOString(),
    });
  }
}
