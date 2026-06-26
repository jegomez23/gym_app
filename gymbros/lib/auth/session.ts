import "server-only";

import { redirect } from "next/navigation";

import {
  createDomainDataLayer,
  type DomainDataLayer,
  type Profile,
} from "@/lib/dal";
import { AppError, InfrastructureError, NotFoundError } from "@/lib/dal/errors";
import { createClient } from "@/lib/supabase/server";

import { onboardingRoute } from "./routes";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

export type AuthContext = {
  user: AuthenticatedUser;
  data: DomainDataLayer;
};

export type ProfileContext = AuthContext & {
  profile: Profile;
};

export async function getUserContext(): Promise<AuthContext | null> {
  const supabase = await createClient();

  if (!supabase) {
    throw new InfrastructureError("Supabase no esta configurado.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    data: createDomainDataLayer(supabase),
  };
}

export async function requireUser(): Promise<AuthContext> {
  const context = await getUserContext();

  if (!context) {
    throw new InfrastructureError("Inicia sesion para continuar.");
  }

  return context;
}

export async function requireProfile(): Promise<ProfileContext> {
  const context = await getUserContext();

  if (!context) {
    redirect("/login");
  }

  const profile = await context.data.services.profiles
    .findProfile(context.user.id)
    .catch((error: unknown) => {
      if (error instanceof NotFoundError) {
        redirect(onboardingRoute);
      }

      throw error;
    });

  if (!profile.onboardingCompleted || profile.deletedAt) {
    redirect(onboardingRoute);
  }

  return {
    ...context,
    profile,
  };
}

export function friendlyAuthError(error: unknown) {
  if (error instanceof AppError) {
    // AppError.message is machine English ("Database operation failed", "Not
    // authorized for this operation") and must never reach a person (Voice). Map
    // every code to a calm human line; log the real cause server-side so a swallowed
    // database/infrastructure failure stays diagnosable instead of invisible.
    switch (error.code) {
      case "conflict":
        return "Ese username ya esta en uso.";
      case "authorization_error":
        return "Tu sesion expiro. Vuelve a entrar e intentalo.";
      case "rate_limit":
        return "Demasiados intentos. Espera un momento e intentalo de nuevo.";
      case "validation_error":
        return "Revisa los datos antes de continuar.";
      default:
        console.error("[friendlyAuthError]", error.code, error.cause ?? error);
        return "No se pudo completar la accion. Intentalo de nuevo.";
    }
  }

  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";

  if (/invalid login credentials/i.test(message)) {
    return "Email o contrasena incorrectos.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Revisa tu email para confirmar la cuenta antes de entrar.";
  }

  if (/already registered|already exists|user already/i.test(message)) {
    return "Ya existe una cuenta con ese email.";
  }

  return "No se pudo completar la accion. Intentalo de nuevo.";
}
