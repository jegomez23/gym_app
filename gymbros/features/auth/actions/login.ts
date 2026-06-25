"use server";

import { redirect } from "next/navigation";

import { createDomainDataLayer } from "@/lib/dal";
import { friendlyAuthError, credentialsSchema, safeReturnTo } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/features/shared/actionState";
import { actionErrorState } from "@/features/shared/server/actionResult";

export async function loginAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    return actionErrorState("Revisa tu email y contrasena.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return actionErrorState("Supabase no esta configurado.");
  }

  const data = createDomainDataLayer(supabase);
  const result = await data.services.auth.signInWithPassword(parsed.data);

  if (result.error) {
    return actionErrorState(friendlyAuthError(result.error));
  }

  if (!result.data.user) {
    return actionErrorState("No se pudo iniciar la sesion.");
  }

  const profile = await data.services.profiles
    .findProfile(result.data.user.id)
    .catch(() => null);

  if (!profile || !profile.onboardingCompleted || profile.deletedAt) {
    redirect("/onboarding");
  }

  redirect(safeReturnTo(parsed.data.returnTo ?? "/"));
}
