"use server";

import { revalidatePath } from "next/cache";

import {
  authErrorState,
  authSuccessState,
  friendlyAuthError,
  updateProfileFormSchema,
  type AuthActionState,
} from "@/lib/auth";
import { requireProfile } from "@/lib/auth/session";

export async function updateProfileAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = updateProfileFormSchema.safeParse({
    username: formData.get("username") || undefined,
    name: formData.get("name") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    bio: formData.get("bio") || undefined,
    visibilityPreference: formData.get("visibilityPreference") || undefined,
    timezone: formData.get("timezone") || undefined,
    locale: formData.get("locale") || undefined,
  });

  if (!parsed.success) {
    return authErrorState("Revisa los cambios de perfil.");
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

    return authSuccessState("Perfil actualizado.");
  } catch (error) {
    return authErrorState(friendlyAuthError(error));
  }
}
