"use server";

import { redirect } from "next/navigation";

import { createDomainDataLayer } from "@/lib/dal";
import { friendlyAuthError, resetPasswordSchema } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/features/shared/actionState";
import { actionErrorState } from "@/features/shared/server/actionResult";

export async function resetPasswordAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return actionErrorState("Las contrasenas deben coincidir y ser seguras.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return actionErrorState("Supabase no esta configurado.");
  }

  const result = await createDomainDataLayer(
    supabase
  ).services.auth.updatePassword(parsed.data.password);

  if (result.error) {
    return actionErrorState(friendlyAuthError(result.error));
  }

  redirect("/profile");
}
