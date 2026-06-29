"use server";

import { revalidatePath } from "next/cache";

import { friendlyAuthError, updateProfileFormSchema } from "@/lib/auth";
import { requireProfile } from "@/lib/auth/session";
import type { ActionState } from "@/features/shared/actionState";
import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";

export async function updateProfileAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = updateProfileFormSchema.safeParse({
    username: formData.get("username") || undefined,
    name: formData.get("name") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    bio: formData.get("bio") || undefined,
    identityStatement: formData.get("identityStatement") ?? undefined,
    chapter: formData.get("chapter") ?? undefined,
    visibilityPreference: formData.get("visibilityPreference") || undefined,
    timezone: formData.get("timezone") || undefined,
    locale: formData.get("locale") || undefined,
  });

  if (!parsed.success) {
    return actionErrorState("Revisa los cambios de perfil.");
  }

  try {
    const context = await requireProfile();
    await context.data.services.profiles.updateProfile(
      context.profile.id,
      parsed.data
    );
    revalidatePath("/");
    revalidatePath("/circle");
    revalidatePath("/profile");

    return actionSuccessState("Perfil actualizado.");
  } catch (error) {
    return actionErrorState(friendlyAuthError(error));
  }
}
