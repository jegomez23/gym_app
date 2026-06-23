"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input } from "@/components/ui/Field";
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
      <Field htmlFor="signup-name" label="Nombre">
        <Input
          autoComplete="name"
          id="signup-name"
          maxLength={100}
          name="name"
          required
        />
      </Field>
      <Field htmlFor="signup-email" label="Email">
        <Input
          autoComplete="email"
          id="signup-email"
          name="email"
          required
          type="email"
        />
      </Field>
      <Field htmlFor="signup-password" label="Contraseña">
        <Input
          autoComplete="new-password"
          id="signup-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </Field>
      <AuthStatus state={state} />
      <AppButton loading={pending} type="submit">
        {pending ? "Creando" : "Crear cuenta"}
      </AppButton>
    </form>
  );
}
