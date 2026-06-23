"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";
import type { Notification } from "@/lib/dal";

import { markNotificationReadAction } from "../actions/markNotificationRead";
import { useNotificationsRealtime } from "../hooks/useNotificationsRealtime";

type NotificationsPanelProps = {
  profileId: string;
  notifications: Notification[];
};

function NotificationReadForm({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    markNotificationReadAction,
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="mt-3">
      <input name="notificationId" type="hidden" value={notificationId} />
      <AppButton
        className="min-h-10 px-4"
        disabled={pending}
        type="submit"
        variant="secondary"
      >
        {pending ? "..." : "Marcar leida"}
      </AppButton>
      <FormStatus state={state} />
    </form>
  );
}

export function NotificationsPanel({
  profileId,
  notifications,
}: NotificationsPanelProps) {
  useNotificationsRealtime(profileId);

  if (notifications.length === 0) {
    return (
      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Notificaciones
        </p>
        <p className="mt-3 text-sm leading-6 text-secondary-text">
          Nada nuevo. Tu Circle sigue tranquilo.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Notificaciones
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-primary-text">
            {
              notifications.filter((notification) => !notification.readAt)
                .length
            }{" "}
            nuevas
          </h2>
        </div>
        <span className="rounded-full border border-[var(--accent-border)] px-4 py-2 text-xs font-semibold text-accent">
          Live
        </span>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {notifications.map((notification) => (
          <div
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
            key={notification.id}
          >
            <p className="text-sm leading-6 text-primary-text">
              {notification.message}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-text">
              {notification.readAt ? "Leida" : "Pendiente"}
            </p>
            {!notification.readAt && (
              <NotificationReadForm notificationId={notification.id} />
            )}
          </div>
        ))}
      </div>
    </AppCard>
  );
}
