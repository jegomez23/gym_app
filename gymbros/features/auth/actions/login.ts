"use server";

import { redirect } from "next/navigation";

import { createDomainDataLayer } from "@/lib/dal";
import {
  authErrorState,
  friendlyAuthError,
  credentialsSchema,
  safeReturnTo,
  type AuthActionState,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: formData.get("returnTo"),
  });

  if (!parsed.success) {
    return authErrorState("Revisa tu email y contrasena.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return authErrorState("Supabase no esta configurado.");
  }

  const data = createDomainDataLayer(supabase);
  const result = await data.services.auth.signInWithPassword(parsed.data);

  if (result.error) {
    return authErrorState(friendlyAuthError(result.error));
  }

  if (!result.data.user) {
    return authErrorState("No se pudo iniciar la sesion.");
  }

  const profile = await data.services.profiles
    .findProfile(result.data.user.id)
    .catch(() => null);

  if (!profile || !profile.onboardingCompleted || profile.deletedAt) {
    redirect("/onboarding");
  }

  redirect(safeReturnTo(parsed.data.returnTo ?? "/"));
}
