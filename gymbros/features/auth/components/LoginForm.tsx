"use client";

import { useActionState } from "react";
import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";
import { initialAuthActionState } from "@/lib/auth/actionState";

import { loginAction } from "../actions/login";
import { AuthStatus } from "./AuthStatus";

type LoginFormProps = {
  returnTo?: string;
};

export function LoginForm({ returnTo = "/" }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialAuthActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="returnTo" type="hidden" value={returnTo} />
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
          autoComplete="current-password"
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-primary-text outline-none focus:border-[var(--accent-border)]"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-secondary-text">
          <input defaultChecked name="remember" type="checkbox" />
          Recordar sesion
        </label>
        <Link className="font-semibold text-accent" href="/forgot-password">
          Olvide mi contrasena
        </Link>
      </div>
      <AuthStatus state={state} />
      <AppButton disabled={pending} type="submit">
        {pending ? "Entrando" : "Entrar"}
      </AppButton>
    </form>
  );
}
