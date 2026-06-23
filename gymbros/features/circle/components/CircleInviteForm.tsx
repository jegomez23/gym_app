"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/Field";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import { inviteCircleMemberAction } from "../actions/manageCircle";

export function CircleInviteForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    inviteCircleMemberAction,
    initialActionState
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form
      action={formAction}
      className="mt-4 rounded-lg border border-white/8 bg-surface-quiet p-4"
    >
      <label
        className="text-label uppercase text-secondary-text"
        htmlFor="circle-invite-username"
      >
        Invitar por username
      </label>
      <div className="mt-3 flex gap-2">
        <Input
          autoComplete="off"
          className="flex-1"
          id="circle-invite-username"
          name="username"
          pattern="[a-z0-9_]+"
          placeholder="gym_partner"
          required
        />
        <AppButton loading={pending} type="submit" variant="secondary">
          {pending ? "" : "Invitar"}
        </AppButton>
      </div>
      <p className="mt-2 text-caption leading-5 text-secondary-text">
        MVP: máximo 8 relaciones activas o pendientes.
      </p>
      <FormStatus state={state} />
    </form>
  );
}
