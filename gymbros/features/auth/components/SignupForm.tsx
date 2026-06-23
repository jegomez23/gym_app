"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { initialAuthActionState } from "@/lib/auth/actionState";

import { signupAction } from "../actions/signup";
import { AuthStatus } from "./AuthStatus";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Nombre
        <input
          autoComplete="name"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          maxLength={100}
          name="name"
          required
        />
      </label>
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
      <label className="flex flex-col gap-2 text-sm text-secondary-text">
        Contrasena
        <input
          autoComplete="new-password"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <AuthStatus state={state} />
      <AppButton disabled={pending} type="submit">
        {pending ? "Creando" : "Crear cuenta"}
      </AppButton>
    </form>
  );
}
