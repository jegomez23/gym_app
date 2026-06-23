"use server";

import { redirect } from "next/navigation";

import { createDomainDataLayer } from "@/lib/dal";
import {
  authErrorState,
  friendlyAuthError,
  resetPasswordSchema,
  type AuthActionState,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return authErrorState("Las contrasenas deben coincidir y ser seguras.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return authErrorState("Supabase no esta configurado.");
  }

  const result = await createDomainDataLayer(
    supabase
  ).services.auth.updatePassword(parsed.data.password);

  if (result.error) {
    return authErrorState(friendlyAuthError(result.error));
  }

  redirect("/profile");
}
