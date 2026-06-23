import type {
  TablesInsert,
  TablesUpdate,
} from "@/supabase/types/database.generated";

import type { DomainDataClient } from "../client";
import { toValidationError } from "../errors";
import { mapCircleMembership } from "../mappers";
import { unwrapData, unwrapList } from "../result";
import {
  changeCircleStatusSchema,
  joinCircleSchema,
  uuidSchema,
} from "../schemas";
import type { ChangeCircleStatusInput, JoinCircleInput } from "../schemas";
import type { CircleMembership } from "../types";

export class CircleRepository {
  constructor(private readonly client: DomainDataClient) {}

  async listCircle(profileId: string): Promise<CircleMembership[]> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const rows = unwrapList(
      await this.client
        .from("circle_memberships")
        .select("*")
        .eq("user_id", parsedProfileId.data)
        .is("deleted_at", null)
        .neq("status", "ended")
        .order("joined_at", { ascending: false })
    );

    return rows.map(mapCircleMembership);
  }

  async joinCircle(
    profileId: string,
    input: JoinCircleInput
  ): Promise<CircleMembership> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedInput = joinCircleSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const insert: TablesInsert<"circle_memberships"> = {
      user_id: parsedProfileId.data,
      circle_user_id: parsedInput.data.circleUserId,
      status: "pending",
      invited_by: parsedProfileId.data,
    };

    const row = unwrapData(
      await this.client
        .from("circle_memberships")
        .insert(insert)
        .select("*")
        .single()
    );

    return mapCircleMembership(row);
  }

  async changeCircleStatus(
    profileId: string,
    input: ChangeCircleStatusInput
  ): Promise<CircleMembership> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedInput = changeCircleStatusSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const update: TablesUpdate<"circle_memberships"> =
      parsedInput.data.status === "ended"
        ? {
            status: "ended",
            deleted_at: new Date().toISOString(),
          }
        : {
            status: parsedInput.data.status,
            deleted_at: null,
          };

    const row = unwrapData(
      await this.client
        .from("circle_memberships")
        .update(update)
        .eq("user_id", parsedProfileId.data)
        .eq("circle_user_id", parsedInput.data.circleUserId)
        .select("*")
        .single()
    );

    return mapCircleMembership(row);
  }

  async leaveCircle(
    profileId: string,
    input: JoinCircleInput
  ): Promise<CircleMembership> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedInput = joinCircleSchema.safeParse(input);
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const update: TablesUpdate<"circle_memberships"> = {
      deleted_at: new Date().toISOString(),
    };

    const row = unwrapData(
      await this.client
        .from("circle_memberships")
        .update(update)
        .eq("user_id", parsedProfileId.data)
        .eq("circle_user_id", parsedInput.data.circleUserId)
        .select("*")
        .single()
    );

    return mapCircleMembership(row);
  }

  async findMembership(
    profileId: string,
    otherProfileId: string
  ): Promise<CircleMembership | null> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    const parsedOtherProfileId = uuidSchema.safeParse(otherProfileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }
    if (!parsedOtherProfileId.success) {
      throw toValidationError(parsedOtherProfileId.error);
    }

    const rows = unwrapList(
      await this.client
        .from("circle_memberships")
        .select("*")
        .eq("user_id", parsedProfileId.data)
        .eq("circle_user_id", parsedOtherProfileId.data)
        .is("deleted_at", null)
        .limit(1)
    );

    return rows[0] ? mapCircleMembership(rows[0]) : null;
  }
}
