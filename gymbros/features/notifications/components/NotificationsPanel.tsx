"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppCard } from "@/components/ui/AppCard";
import { initialActionState } from "@/features/shared/actionState";
import type { Notification } from "@/lib/dal";

import { markNotificationReadAction } from "../actions/markNotificationRead";
import { useNotificationsRealtime } from "../hooks/useNotificationsRealtime";

type NotificationsPanelProps = {
  profileId: string;
  notifications: Notification[];
};

// Tapping a notification quietly acknowledges it — no separate "mark read" chore.
function NotificationCard({ notification }: { notification: Notification }) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    markNotificationReadAction,
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  if (notification.readAt) {
    return (
      <div className="rounded-md border border-white/6 bg-white/3 p-4">
        <p className="text-caption leading-6 text-secondary-text">
          {notification.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input name="notificationId" type="hidden" value={notification.id} />
      <button
        className="w-full rounded-md border border-accent-border bg-accent-soft p-4 text-left transition duration-(--duration-fast) ease-out-soft active:scale-[0.99]"
        type="submit"
      >
        <p className="text-caption leading-6 text-primary-text">
          {notification.message}
        </p>
      </button>
    </form>
  );
}

export function NotificationsPanel({
  profileId,
  notifications,
}: NotificationsPanelProps) {
  useNotificationsRealtime(profileId);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <AppCard level="quiet">
      <p className="text-label uppercase text-secondary-text">Tu círculo</p>
      <div className="mt-4 flex flex-col gap-3">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </AppCard>
  );
}
