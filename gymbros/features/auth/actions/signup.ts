"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createDomainDataLayer } from "@/lib/dal";
import { friendlyAuthError, signUpSchema } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/features/shared/actionState";
import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";

export async function signupAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return actionErrorState("Revisa los datos para crear tu cuenta.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return actionErrorState("Supabase no esta configurado.");
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
    return actionErrorState(friendlyAuthError(result.error));
  }

  if (!result.data.session) {
    return actionSuccessState(
      "Cuenta creada. Revisa tu email para confirmar el acceso."
    );
  }

  redirect("/onboarding");
}
