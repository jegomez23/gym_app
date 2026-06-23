import type {
  TablesInsert,
  TablesUpdate,
} from "@/supabase/types/database.generated";

import type { DomainDataClient } from "../client";
import { toValidationError } from "../errors";
import { mapReflection } from "../mappers";
import { unwrapData, unwrapList } from "../result";
import {
  createReflectionSchema,
  editReflectionSchema,
  uuidSchema,
} from "../schemas";
import type { CreateReflectionInput, EditReflectionInput } from "../schemas";
import type { Reflection } from "../types";

export class ReflectionRepository {
  constructor(private readonly client: DomainDataClient) {}

  async createReflection(
    profileId: string,
    input: CreateReflectionInput
  ): Promise<Reflection> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedInput = createReflectionSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const insert: TablesInsert<"reflections"> = {
      user_id: parsedProfileId.data,
      commit_id: parsedInput.data.commitId,
      content: parsedInput.data.content,
      type: parsedInput.data.type,
      visibility: parsedInput.data.visibility,
    };

    const row = unwrapData(
      await this.client.from("reflections").insert(insert).select("*").single()
    );

    return mapReflection(row);
  }

  async listReflectionsForCommit(commitId: string): Promise<Reflection[]> {
    const parsedId = uuidSchema.safeParse(commitId);
    if (!parsedId.success) {
      throw toValidationError(parsedId.error);
    }

    const rows = unwrapList(
      await this.client
        .from("reflections")
        .select("*")
        .eq("commit_id", parsedId.data)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
    );

    return rows.map(mapReflection);
  }

  async editReflection(input: EditReflectionInput): Promise<Reflection> {
    const parsedInput = editReflectionSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const update: TablesUpdate<"reflections"> = {
      ...(parsedInput.data.content !== undefined && {
        content: parsedInput.data.content,
      }),
      ...(parsedInput.data.type !== undefined && {
        type: parsedInput.data.type,
      }),
      ...(parsedInput.data.visibility !== undefined && {
        visibility: parsedInput.data.visibility,
      }),
    };

    const row = unwrapData(
      await this.client
        .from("reflections")
        .update(update)
        .eq("id", parsedInput.data.reflectionId)
        .select("*")
        .single()
    );

    return mapReflection(row);
  }

  async removeReflection(reflectionId: string): Promise<Reflection> {
    const parsedId = uuidSchema.safeParse(reflectionId);
    if (!parsedId.success) {
      throw toValidationError(parsedId.error);
    }

    const update: TablesUpdate<"reflections"> = {
      deleted_at: new Date().toISOString(),
    };

    const row = unwrapData(
      await this.client
        .from("reflections")
        .update(update)
        .eq("id", parsedId.data)
        .select("*")
        .single()
    );

    return mapReflection(row);
  }
}
