"use server";

import { redirect } from "next/navigation";

import { friendlyAuthError } from "@/lib/auth";
import { requireProfile } from "@/lib/auth/session";
import type { ActionState } from "@/features/shared/actionState";
import { actionErrorState } from "@/features/shared/server/actionResult";

export async function deleteProfileAction(
  _previousState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  try {
    const context = await requireProfile();
    await context.data.services.profiles.softDeleteProfile(context.profile.id);
    await context.data.services.auth.signOut();
  } catch (error) {
    return actionErrorState(friendlyAuthError(error));
  }

  redirect("/login");
}
