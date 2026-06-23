"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import {
  acceptCircleInvitationAction,
  leaveCircleAction,
  rejectCircleInvitationAction,
} from "../actions/manageCircle";

type CircleMemberActionFormProps = {
  memberId: string;
  mode: "accept" | "reject" | "leave" | "cancel";
};

const actionByMode = {
  accept: acceptCircleInvitationAction,
  reject: rejectCircleInvitationAction,
  leave: leaveCircleAction,
  cancel: leaveCircleAction,
} as const;

const labelByMode = {
  accept: "Aceptar",
  reject: "Rechazar",
  leave: "Salir",
  cancel: "Cancelar",
} as const;

export function CircleMemberActionForm({
  memberId,
  mode,
}: CircleMemberActionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    actionByMode[mode],
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input name="memberId" type="hidden" value={memberId} />
      <AppButton
        loading={pending}
        size="md"
        type="submit"
        variant={mode === "accept" ? "primary" : "secondary"}
      >
        {labelByMode[mode]}
      </AppButton>
      <FormStatus state={state} />
    </form>
  );
}
