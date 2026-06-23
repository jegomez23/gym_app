import type {
  TablesInsert,
  TablesUpdate,
} from "@/supabase/types/database.generated";

import type { DomainDataClient } from "../client";
import { toValidationError } from "../errors";
import { mapNotification } from "../mappers";
import { unwrapData, unwrapList } from "../result";
import {
  createNotificationSchema,
  paginationSchema,
  uuidSchema,
} from "../schemas";
import type { CreateNotificationInput } from "../schemas";
import type { Notification, PaginationOptions } from "../types";

export class NotificationRepository {
  constructor(private readonly client: DomainDataClient) {}

  async createNotification(
    actorUserId: string,
    input: CreateNotificationInput
  ): Promise<Notification> {
    const parsedActorId = uuidSchema.safeParse(actorUserId);
    if (!parsedActorId.success) {
      throw toValidationError(parsedActorId.error);
    }

    const parsedInput = createNotificationSchema.safeParse({
      ...input,
      actorUserId: input.actorUserId ?? parsedActorId.data,
    });
    if (!parsedInput.success) {
      throw toValidationError(parsedInput.error);
    }

    const insert: TablesInsert<"notifications"> = {
      recipient_user_id: parsedInput.data.recipientUserId,
      actor_user_id: parsedInput.data.actorUserId ?? parsedActorId.data,
      type: parsedInput.data.type,
      entity_type: parsedInput.data.entityType ?? null,
      entity_id: parsedInput.data.entityId ?? null,
      message: parsedInput.data.message,
    };

    const row = unwrapData(
      await this.client
        .from("notifications")
        .insert(insert)
        .select("*")
        .single()
    );

    return mapNotification(row);
  }

  async listNotifications(
    profileId: string,
    options: PaginationOptions = {}
  ): Promise<Notification[]> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }

    const parsedOptions = paginationSchema.safeParse(options);
    if (!parsedOptions.success) {
      throw toValidationError(parsedOptions.error);
    }

    let query = this.client
      .from("notifications")
      .select("*")
      .eq("recipient_user_id", parsedProfileId.data)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(parsedOptions.data.limit ?? 20);

    if (parsedOptions.data.before) {
      query = query.lt("created_at", parsedOptions.data.before);
    }

    return unwrapList(await query).map(mapNotification);
  }

  async markNotificationRead(
    profileId: string,
    notificationId: string
  ): Promise<Notification> {
    const parsedProfileId = uuidSchema.safeParse(profileId);
    const parsedNotificationId = uuidSchema.safeParse(notificationId);
    if (!parsedProfileId.success) {
      throw toValidationError(parsedProfileId.error);
    }
    if (!parsedNotificationId.success) {
      throw toValidationError(parsedNotificationId.error);
    }

    const update: TablesUpdate<"notifications"> = {
      read_at: new Date().toISOString(),
    };

    const row = unwrapData(
      await this.client
        .from("notifications")
        .update(update)
        .eq("id", parsedNotificationId.data)
        .eq("recipient_user_id", parsedProfileId.data)
        .select("*")
        .single()
    );

    return mapNotification(row);
  }
}
