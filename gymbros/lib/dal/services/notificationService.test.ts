import { describe, expect, it, vi } from "vitest";

import type { Notification } from "../types";
import { NotificationService } from "./notificationService";

const profileId = "00000000-0000-0000-0000-000000000001";
const notification: Notification = {
  id: "30000000-0000-0000-0000-000000000001",
  recipientUserId: profileId,
  actorUserId: "00000000-0000-0000-0000-000000000002",
  type: "support_received",
  entityType: "support",
  entityId: "20000000-0000-0000-0000-000000000001",
  message: "Partner te envio apoyo.",
  readAt: null,
  createdAt: "2026-06-22T08:00:00.000Z",
  deletedAt: null,
};

describe("NotificationService", () => {
  it("orchestrates notification persistence without exposing Supabase details", async () => {
    const notifications = {
      createNotification: vi.fn().mockResolvedValue(notification),
      listNotifications: vi.fn().mockResolvedValue([notification]),
      markNotificationRead: vi.fn().mockResolvedValue({
        ...notification,
        readAt: "2026-06-22T09:00:00.000Z",
      }),
    };
    const service = new NotificationService(notifications);

    await expect(
      service.listNotifications(profileId, { limit: 5 })
    ).resolves.toEqual([notification]);
    await expect(
      service.markNotificationRead(profileId, notification.id)
    ).resolves.toMatchObject({ readAt: "2026-06-22T09:00:00.000Z" });

    expect(notifications.listNotifications).toHaveBeenCalledWith(profileId, {
      limit: 5,
    });
    expect(notifications.markNotificationRead).toHaveBeenCalledWith(
      profileId,
      notification.id
    );
  });
});
