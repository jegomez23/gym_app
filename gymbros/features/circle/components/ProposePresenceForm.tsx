"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { initialActionState } from "@/features/shared/actionState";

import { proposeSharedPresenceAction } from "../actions/proposeSharedPresence";

type ProposePresenceFormProps = {
  partnerId: string;
};

// A quiet gift, not a demand: one tap proposes appearing together, then settles
// into a calm confirmation. No tracker, no waiting, nothing to disappoint.
export function ProposePresenceForm({ partnerId }: ProposePresenceFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    proposeSharedPresenceAction,
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  if (state.status === "success") {
    return (
      <p className="text-caption text-secondary-text">Aparecerán juntos.</p>
    );
  }

  return (
    <form action={formAction}>
      <input name="partnerId" type="hidden" value={partnerId} />
      <AppButton loading={pending} type="submit" variant="secondary">
        {pending ? "Enviando" : "Aparecer juntos"}
      </AppButton>
    </form>
  );
}
