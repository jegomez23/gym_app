import type { CreateNotificationInput } from "../schemas";
import type { Notification, PaginationOptions } from "../types";

type NotificationDataAccess = {
  createNotification(
    actorUserId: string,
    input: CreateNotificationInput
  ): Promise<Notification>;
  listNotifications(
    profileId: string,
    options?: PaginationOptions
  ): Promise<Notification[]>;
  markNotificationRead(
    profileId: string,
    notificationId: string
  ): Promise<Notification>;
};

export class NotificationService {
  constructor(private readonly notifications: NotificationDataAccess) {}

  createNotification(
    actorUserId: string,
    input: CreateNotificationInput
  ): Promise<Notification> {
    return this.notifications.createNotification(actorUserId, input);
  }

  listNotifications(
    profileId: string,
    options?: PaginationOptions
  ): Promise<Notification[]> {
    return this.notifications.listNotifications(profileId, options);
  }

  markNotificationRead(
    profileId: string,
    notificationId: string
  ): Promise<Notification> {
    return this.notifications.markNotificationRead(profileId, notificationId);
  }
}
