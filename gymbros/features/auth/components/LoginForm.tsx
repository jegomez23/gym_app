"use client";

import { useActionState } from "react";
import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input } from "@/components/ui/Field";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import { loginAction } from "../actions/login";

type LoginFormProps = {
  returnTo?: string;
};

export function LoginForm({ returnTo = "/" }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name="returnTo" type="hidden" value={returnTo} />
      <Field htmlFor="login-email" label="Email">
        <Input
          autoComplete="email"
          id="login-email"
          name="email"
          required
          type="email"
        />
      </Field>
      <Field htmlFor="login-password" label="Contraseña">
        <Input
          autoComplete="current-password"
          id="login-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </Field>
      <div className="flex items-center justify-between gap-3 text-caption">
        <label className="flex items-center gap-2 text-secondary-text">
          <input defaultChecked name="remember" type="checkbox" />
          Recordar sesion
        </label>
        <Link className="font-semibold text-accent" href="/forgot-password">
          Olvide mi contrasena
        </Link>
      </div>
      <FormStatus state={state} />
      <AppButton loading={pending} type="submit">
        {pending ? "Entrando" : "Entrar"}
      </AppButton>
    </form>
  );
}
