"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createDomainDataLayer } from "@/lib/dal";
import {
  authErrorState,
  authSuccessState,
  friendlyAuthError,
  signUpSchema,
  type AuthActionState,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return authErrorState("Revisa los datos para crear tu cuenta.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return authErrorState("Supabase no esta configurado.");
  }

  const origin = (await headers()).get("origin") ?? "";
  const data = createDomainDataLayer(supabase);
  const result = await data.services.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
    emailRedirectTo: origin
      ? `${origin}/auth/callback?next=/onboarding`
      : undefined,
  });

  if (result.error) {
    return authErrorState(friendlyAuthError(result.error));
  }

  if (!result.data.session) {
    return authSuccessState(
      "Cuenta creada. Revisa tu email para confirmar el acceso."
    );
  }

  redirect("/onboarding");
}
