"use client";

import { useActionState, useState } from "react";

import { AppButton } from "@/components/ui/AppButton";
import { AuthStatus } from "@/features/auth/components/AuthStatus";
import { initialAuthActionState } from "@/lib/auth/actionState";

import { deleteProfileAction } from "../actions/deleteProfile";

export function DeleteAccountForm() {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    deleteProfileAction,
    initialAuthActionState
  );

  if (!confirming) {
    return (
      <AppButton
        className="mt-4 w-full border-red-400/20 text-red-300/70 hover:border-red-400/40 hover:text-red-300"
        onClick={() => setConfirming(true)}
        type="button"
        variant="secondary"
      >
        Eliminar cuenta
      </AppButton>
    );
  }

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <p className="text-sm leading-6 text-red-300/80">
        Esta accion desactivara tu cuenta. Tus datos no se eliminan
        inmediatamente. No podras iniciar sesion hasta que la cuenta sea
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
        <AppButton
          className="border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
          disabled={pending}
          type="submit"
          variant="secondary"
        >
          {pending ? "Eliminando..." : "Confirmar"}
        </AppButton>
      </div>
      <AuthStatus state={state} />
    </form>
  );
}
