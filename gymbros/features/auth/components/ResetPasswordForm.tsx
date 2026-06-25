"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { Field, Input } from "@/components/ui/Field";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import { resetPasswordAction } from "../actions/resetPassword";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field htmlFor="reset-password" label="Nueva contraseña">
        <Input
          autoComplete="new-password"
          id="reset-password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </Field>
      <Field htmlFor="reset-confirm" label="Confirmar contraseña">
        <Input
          autoComplete="new-password"
          id="reset-confirm"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
      </Field>
      <FormStatus state={state} />
      <AppButton loading={pending} type="submit">
        {pending ? "Actualizando" : "Actualizar contraseña"}
      </AppButton>
    </form>
  );
}
