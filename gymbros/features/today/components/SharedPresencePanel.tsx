"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { markNotificationReadAction } from "@/features/notifications/actions/markNotificationRead";
import { initialActionState } from "@/features/shared/actionState";
import type {
  ActivePresence,
  PendingPresence,
} from "@/lib/presence/deriveSharedPresence";

type SharedPresencePanelProps = {
  pending: PendingPresence[];
  active: ActivePresence[];
};

const ACTIVE_LINE: Record<ActivePresence["status"], (name: string) => string> =
  {
    together: () => "Los dos aparecieron.",
    almost: () => "Queda una presencia.",
    waiting: (name) => `Hoy aparecen juntos, tú y ${name}.`,
  };

// Accepting is the lightest possible act: acknowledging the invitation. From
// then on the pact resolves itself from evidence — there is nothing to manage.
function PendingInvite({ invite }: { invite: PendingPresence }) {
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
    <div className="flex items-center justify-between gap-4">
      <p className="text-body text-primary-text">
        {invite.partnerName} quiere aparecer contigo hoy.
      </p>
      <form action={formAction}>
        <input
          name="notificationId"
          type="hidden"
          value={invite.notificationId}
        />
        <AppButton loading={pending} type="submit" variant="secondary">
          {pending ? "…" : "Aparecer juntos"}
        </AppButton>
      </form>
    </div>
  );
}

export function SharedPresencePanel({
  pending,
  active,
}: SharedPresencePanelProps) {
  if (pending.length === 0 && active.length === 0) {
    return null;
  }

  return (
    <AppCard level="quiet">
      <p className="text-label uppercase text-secondary-text">
        Presencia compartida
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {pending.map((invite) => (
          <PendingInvite invite={invite} key={invite.notificationId} />
        ))}
        {active.map((pact) => (
          <p
            className={
              pact.status === "together"
                ? "text-body text-accent"
                : "text-body text-primary-text"
            }
            key={pact.partnerId}
          >
            {ACTIVE_LINE[pact.status](pact.partnerName)}
          </p>
        ))}
      </div>
    </AppCard>
  );
}
