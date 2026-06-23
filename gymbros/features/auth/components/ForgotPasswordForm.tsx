"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input } from "@/components/ui/Field";
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
      <Field htmlFor="forgot-email" label="Email">
        <Input
          autoComplete="email"
          id="forgot-email"
          name="email"
          required
          type="email"
        />
      </Field>
      <AuthStatus state={state} />
      <AppButton loading={pending} type="submit">
        {pending ? "Enviando" : "Enviar enlace"}
      </AppButton>
    </form>
  );
}
