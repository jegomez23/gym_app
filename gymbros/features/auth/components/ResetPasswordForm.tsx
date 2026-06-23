"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { initialAuthActionState } from "@/lib/auth/actionState";

import { resetPasswordAction } from "../actions/resetPassword";
import { AuthStatus } from "./AuthStatus";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Nueva contrasena
        <input
          autoComplete="new-password"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Confirmar contrasena
        <input
          autoComplete="new-password"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
      </label>
      <AuthStatus state={state} />
      <AppButton disabled={pending} type="submit">
        {pending ? "Actualizando" : "Actualizar contrasena"}
      </AppButton>
    </form>
  );
}
