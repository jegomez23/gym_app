"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input } from "@/components/ui/Field";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import { forgotPasswordAction } from "../actions/forgotPassword";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialActionState
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
      <FormStatus state={state} />
      <AppButton loading={pending} type="submit">
        {pending ? "Enviando" : "Enviar enlace"}
      </AppButton>
    </form>
  );
}
