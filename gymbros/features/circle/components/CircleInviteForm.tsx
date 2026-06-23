"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppButton } from "@/components/ui/AppButton";
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
      className="mt-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4"
    >
      <label
        className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text"
        htmlFor="circle-invite-username"
      >
        Invitar por username
      </label>
      <div className="mt-3 flex gap-2">
        <input
          autoComplete="off"
          className="min-h-12 flex-1 rounded-2xl border border-white/8 bg-[#111410] px-4 text-sm text-primary-text outline-none focus:border-[var(--accent-border)]"
          id="circle-invite-username"
          name="username"
          pattern="[a-z0-9_]+"
          placeholder="gym_partner"
          required
        />
        <AppButton disabled={pending} type="submit" variant="secondary">
          {pending ? "..." : "Invitar"}
        </AppButton>
      </div>
      <p className="mt-2 text-xs leading-5 text-secondary-text">
        MVP: maximo 8 relaciones activas o pendientes.
      </p>
      <FormStatus state={state} />
    </form>
  );
}
