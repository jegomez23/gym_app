"use server";

import { redirect } from "next/navigation";

import {
  authErrorState,
  friendlyAuthError,
  type AuthActionState,
} from "@/lib/auth";
import { requireProfile } from "@/lib/auth/session";

export async function deleteProfileAction(
  _previousState: AuthActionState,
  _formData: FormData
): Promise<AuthActionState> {
  try {
    const context = await requireProfile();
    await context.data.services.profiles.softDeleteProfile(context.profile.id);
    await context.data.services.auth.signOut();
  } catch (error) {
    return authErrorState(friendlyAuthError(error));
  }

  redirect("/login");
}
