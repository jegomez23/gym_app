"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { initialAuthActionState } from "@/lib/auth/actionState";

import { forgotPasswordAction } from "../actions/forgotPassword";
import { AuthStatus } from "./AuthStatus";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Email
        <input
          autoComplete="email"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          name="email"
          required
          type="email"
        />
      </label>
      <AuthStatus state={state} />
      <AppButton disabled={pending} type="submit">
        {pending ? "Enviando" : "Enviar enlace"}
      </AppButton>
    </form>
  );
}
