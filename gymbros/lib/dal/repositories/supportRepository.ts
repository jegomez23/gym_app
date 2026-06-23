import type {
  TablesInsert,
  TablesUpdate,
} from "@/supabase/types/database.generated";

import type { DomainDataClient } from "../client";
import { toValidationError } from "../errors";
import { mapSupport } from "../mappers";
import { unwrapData, unwrapList } from "../result";
import { sendSupportSchema, uuidSchema } from "../schemas";
import type { SendSupportInput } from "../schemas";
import type { Support } from "../types";

export class SupportRepository {
  constructor(private readonly client: DomainDataClient) {}

  async listSupportHistory(
    profileId: string,
    otherProfileId: string
  ): Promise<Support[]> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    const parsedOtherProfileId = uuidSchema.safeParse(otherProfileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }
    if (!parsedOtherProfileId.success) {
      throw toValidationError(parsedOtherProfileId.error);
    }

    const sent = await this.client
      .from("supports")
      .select("*")
      .eq("from_user_id", parsedProfileId.data)
      .eq("to_user_id", parsedOtherProfileId.data)
      .is("deleted_at", null);

    const received = await this.client
      .from("supports")
      .select("*")
      .eq("from_user_id", parsedOtherProfileId.data)
      .eq("to_user_id", parsedProfileId.data)
      .is("deleted_at", null);

    return [...unwrapList(sent), ...unwrapList(received)]
      .map(mapSupport)
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      );
  }

  async listRecentSupportsForProfile(
    profileId: string,
    limit = 10
  ): Promise<Support[]> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const received = await this.client
      .from("supports")
      .select("*")
      .eq("to_user_id", parsedProfileId.data)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    const sent = await this.client
      .from("supports")
      .select("*")
      .eq("from_user_id", parsedProfileId.data)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    return [...unwrapList(received), ...unwrapList(sent)]
      .map(mapSupport)
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      )
      .slice(0, limit);
  }

  async hasSentSupportSince(
    fromUserId: string,
    toUserId: string,
    since: string
  ): Promise<boolean> {
    const parsedFromUserId = uuidSchema.safeParse(fromUserId);
    const parsedToUserId = uuidSchema.safeParse(toUserId);
    if (!parsedFromUserId.success) {
      throw toValidationError(parsedFromUserId.error);
    }
    if (!parsedToUserId.success) {
      throw toValidationError(parsedToUserId.error);
    }

    const rows = unwrapList(
      await this.client
        .from("supports")
        .select("id")
        .eq("from_user_id", parsedFromUserId.data)
        .eq("to_user_id", parsedToUserId.data)
        .gte("created_at", since)
        .is("deleted_at", null)
        .limit(1)
    );

    return rows.length > 0;
  }

  async sendSupport(
    profileId: string,
    input: SendSupportInput
  ): Promise<Support> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedInput = sendSupportSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const insert: TablesInsert<"supports"> = {
      from_user_id: parsedProfileId.data,
      to_user_id: parsedInput.data.toUserId,
      message: parsedInput.data.message,
    };

    const row = unwrapData(
      await this.client.from("supports").insert(insert).select("*").single()
    );

    return mapSupport(row);
  }

  async removeSupport(supportId: string): Promise<Support> {
    const parsedId = uuidSchema.safeParse(supportId);
    if (!parsedId.success) {
      throw toValidationError(parsedId.error);
    }

    const update: TablesUpdate<"supports"> = {
      deleted_at: new Date().toISOString(),
    };

    const row = unwrapData(
      await this.client
        .from("supports")
        .update(update)
        .eq("id", parsedId.data)
        .select("*")
        .single()
    );

    return mapSupport(row);
  }
}
