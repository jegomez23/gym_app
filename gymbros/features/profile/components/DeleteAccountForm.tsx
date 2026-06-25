"use client";

import { useActionState, useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { FormStatus } from "@/features/shared";
import { initialActionState } from "@/features/shared/actionState";

import { deleteProfileAction } from "../actions/deleteProfile";

export function DeleteAccountForm() {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    deleteProfileAction,
    initialActionState
  );

  if (!confirming) {
    return (
      <AppButton
        className="mt-4 w-full"
        onClick={() => setConfirming(true)}
        type="button"
        variant="ghost"
      >
        Eliminar cuenta
      </AppButton>
    );
  }

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <p className="text-caption leading-6 text-danger">
        Esta acción desactivará tu cuenta. Tus datos no se eliminan
        inmediatamente. No podrás iniciar sesión hasta que la cuenta sea
        restaurada.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <AppButton
          disabled={pending}
          onClick={() => setConfirming(false)}
          type="button"
          variant="secondary"
        >
          Cancelar
        </AppButton>
        <AppButton loading={pending} type="submit" variant="danger">
          {pending ? "Eliminando" : "Confirmar"}
        </AppButton>
      </div>
      <FormStatus state={state} />
    </form>
  );
}
