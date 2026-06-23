"use server";

import { headers } from "next/headers";

import { createDomainDataLayer } from "@/lib/dal";
import {
  authErrorState,
  authSuccessState,
  forgotPasswordSchema,
  friendlyAuthError,
  type AuthActionState,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return authErrorState("Escribe un email valido.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return authErrorState("Supabase no esta configurado.");
  }

  const origin = (await headers()).get("origin") ?? "";
  const result = await createDomainDataLayer(
    supabase
  ).services.auth.resetPasswordForEmail(
    parsed.data.email,
    origin ? `${origin}/auth/callback?next=/reset-password` : "/reset-password"
  );

  if (result.error) {
    return authErrorState(friendlyAuthError(result.error));
  }

  return authSuccessState("Si el email existe, recibiras un enlace de reset.");
}
