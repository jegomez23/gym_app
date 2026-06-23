import type {
  TablesInsert,
  TablesUpdate,
} from "@/supabase/types/database.generated";

import type { DomainDataClient } from "../client";
import { toValidationError } from "../errors";
import { mapProfile } from "../mappers";
import { unwrapData, unwrapList } from "../result";
import {
  createProfileSchema,
  updateProfileSchema,
  uuidSchema,
} from "../schemas";
import type { Profile } from "../types";
import type { CreateProfileInput, UpdateProfileInput } from "../schemas";

export class ProfileRepository {
  constructor(private readonly client: DomainDataClient) {}

  async findProfile(profileId: string): Promise<Profile> {
    const parsedId = uuidSchema.safeParse(profileId);
    if (!parsedId.success) {
      throw toValidationError(parsedId.error);
    }

    const row = unwrapData(
      await this.client
        .from("profiles")
        .select("*")
        .eq("id", parsedId.data)
        .is("deleted_at", null)
        .single()
    );

    return mapProfile(row);
  }

  async createProfile(input: CreateProfileInput): Promise<Profile> {
    const parsedInput = createProfileSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const insert: TablesInsert<"profiles"> = {
      id: parsedInput.data.id,
      username: parsedInput.data.username,
      name: parsedInput.data.name,
      avatar_url: parsedInput.data.avatarUrl,
      bio: parsedInput.data.bio,
      visibility_preference: parsedInput.data.visibilityPreference,
      onboarding_completed: parsedInput.data.onboardingCompleted,
      timezone: parsedInput.data.timezone,
      locale: parsedInput.data.locale,
    };

    const row = unwrapData(
      await this.client.from("profiles").insert(insert).select("*").single()
    );

    return mapProfile(row);
  }

  async findProfileByUsername(username: string): Promise<Profile | null> {
    const parsedUsername =
      createProfileSchema.shape.username.safeParse(username);
    if (!parsedUsername.success) {
      throw toValidationError(parsedUsername.error);
    }

    const rows = unwrapList(
      await this.client
        .from("profiles")
        .select("*")
        .ilike("username", parsedUsername.data)
        .is("deleted_at", null)
        .limit(1)
    );

    return rows[0] ? mapProfile(rows[0]) : null;
  }

  async listProfilesByIds(profileIds: string[]): Promise<Profile[]> {
    const uniqueIds = [...new Set(profileIds)];

    for (const profileId of uniqueIds) {
      const parsedId = uuidSchema.safeParse(profileId);
      if (!parsedId.success) {
        throw toValidationError(parsedId.error);
      }
    }

    if (uniqueIds.length === 0) {
      return [];
    }

    const rows = unwrapList(
      await this.client
        .from("profiles")
        .select("*")
        .in("id", uniqueIds)
        .is("deleted_at", null)
    );

    return rows.map(mapProfile);
  }

  async updateProfile(
    profileId: string,
    input: UpdateProfileInput
  ): Promise<Profile> {
    const parsedId = uuidSchema.safeParse(profileId);
    if (!parsedId.success) {
      throw toValidationError(parsedId.error);
    }

    const parsedInput = updateProfileSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const update: TablesUpdate<"profiles"> = {
      ...(parsedInput.data.username !== undefined && {
        username: parsedInput.data.username,
      }),
      ...(parsedInput.data.name !== undefined && {
        name: parsedInput.data.name,
      }),
      ...(parsedInput.data.avatarUrl !== undefined && {
        avatar_url: parsedInput.data.avatarUrl,
      }),
      ...(parsedInput.data.bio !== undefined && { bio: parsedInput.data.bio }),
      ...(parsedInput.data.visibilityPreference !== undefined && {
        visibility_preference: parsedInput.data.visibilityPreference,
      }),
      ...(parsedInput.data.onboardingCompleted !== undefined && {
        onboarding_completed: parsedInput.data.onboardingCompleted,
      }),
      ...(parsedInput.data.timezone !== undefined && {
        timezone: parsedInput.data.timezone,
      }),
      ...(parsedInput.data.locale !== undefined && {
        locale: parsedInput.data.locale,
      }),
      ...(parsedInput.data.deletedAt !== undefined && {
        deleted_at: parsedInput.data.deletedAt,
      }),
    };

    const row = unwrapData(
      await this.client
        .from("profiles")
        .update(update)
        .eq("id", parsedId.data)
        .select("*")
        .single()
    );

    return mapProfile(row);
  }
}
