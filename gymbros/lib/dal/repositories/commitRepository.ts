import type {
  TablesInsert,
  TablesUpdate,
} from "@/supabase/types/database.generated";

import type { DomainDataClient } from "../client";
import { toValidationError } from "../errors";
import { mapCommit } from "../mappers";
import { unwrapData, unwrapList } from "../result";
import {
  changeCommitVisibilitySchema,
  paginationSchema,
  publishCommitSchema,
  uuidSchema,
} from "../schemas";
import type {
  ChangeCommitVisibilityInput,
  PublishCommitInput,
} from "../schemas";
import type { Commit, PaginationOptions } from "../types";

export class CommitRepository {
  constructor(private readonly client: DomainDataClient) {}

  async publishCommit(
    profileId: string,
    input: PublishCommitInput
  ): Promise<Commit> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedInput = publishCommitSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const insert: TablesInsert<"commits"> = {
      user_id: parsedProfileId.data,
      title: parsedInput.data.title,
      type: parsedInput.data.type,
      recorded_at: parsedInput.data.recordedAt,
      duration_minutes: parsedInput.data.durationMinutes,
      intensity: parsedInput.data.intensity,
      note: parsedInput.data.note,
      visibility: parsedInput.data.visibility,
      evidence: parsedInput.data.evidence,
    };

    const row = unwrapData(
      await this.client.from("commits").insert(insert).select("*").single()
    );

    return mapCommit(row);
  }

  async findCommit(commitId: string): Promise<Commit> {
    const parsedId = uuidSchema.safeParse(commitId);
    if (!parsedId.success) {
      throw toValidationError(parsedId.error);
    }

    const row = unwrapData(
      await this.client
        .from("commits")
        .select("*")
        .eq("id", parsedId.data)
        .is("deleted_at", null)
        .single()
    );

    return mapCommit(row);
  }

  async listCommitsForProfile(
    profileId: string,
    options: PaginationOptions = {}
  ): Promise<Commit[]> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedOptions = paginationSchema.safeParse(options);
    if (!parsedOptions.success) {
      throw toValidationError(parsedOptions.error);
    }

    let query = this.client
      .from("commits")
      .select("*")
      .eq("user_id", parsedProfileId.data)
      .is("deleted_at", null)
      .order("recorded_at", { ascending: false })
      .limit(parsedOptions.data.limit ?? 30);

    if (parsedOptions.data.before) {
      query = query.lt("recorded_at", parsedOptions.data.before);
    }

    return unwrapList(await query).map(mapCommit);
  }

  async changeCommitVisibility(
    input: ChangeCommitVisibilityInput
  ): Promise<Commit> {
    const parsedInput = changeCommitVisibilitySchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const update: TablesUpdate<"commits"> = {
      visibility: parsedInput.data.visibility,
    };

    const row = unwrapData(
      await this.client
        .from("commits")
        .update(update)
        .eq("id", parsedInput.data.commitId)
        .select("*")
        .single()
    );

    return mapCommit(row);
  }

  async removeCommit(commitId: string): Promise<Commit> {
    const parsedId = uuidSchema.safeParse(commitId);
    if (!parsedId.success) {
      throw toValidationError(parsedId.error);
    }

    const update: TablesUpdate<"commits"> = {
      deleted_at: new Date().toISOString(),
    };

    const row = unwrapData(
      await this.client
        .from("commits")
        .update(update)
        .eq("id", parsedId.data)
        .select("*")
        .single()
    );

    return mapCommit(row);
  }
}
