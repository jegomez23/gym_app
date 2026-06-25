"use server";

import { headers } from "next/headers";

import { createDomainDataLayer } from "@/lib/dal";
import { forgotPasswordSchema, friendlyAuthError } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/features/shared/actionState";
import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";

export async function forgotPasswordAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return actionErrorState("Escribe un email valido.");
  }

  const supabase = await createClient();
  if (!supabase) {
    return actionErrorState("Supabase no esta configurado.");
  }

  const origin = (await headers()).get("origin") ?? "";
  const result = await createDomainDataLayer(
    supabase
  ).services.auth.resetPasswordForEmail(
    parsed.data.email,
    origin ? `${origin}/auth/callback?next=/reset-password` : "/reset-password"
  );

  if (result.error) {
    return actionErrorState(friendlyAuthError(result.error));
  }

  return actionSuccessState(
    "Si el email existe, recibiras un enlace de reset."
  );
}
