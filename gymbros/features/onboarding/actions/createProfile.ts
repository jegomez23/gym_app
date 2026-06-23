"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  authErrorState,
  friendlyAuthError,
  onboardingProfileSchema,
  safeReturnTo,
  type AuthActionState,
} from "@/lib/auth";
import { NotFoundError } from "@/lib/dal/errors";
import { requireUser } from "@/lib/auth/session";

export async function createProfileAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = onboardingProfileSchema.safeParse({
    username: formData.get("username"),
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
    bio: formData.get("bio"),
    visibilityPreference: formData.get("visibilityPreference") || "circle",
    timezone: formData.get("timezone") || "UTC",
    locale: formData.get("locale") || "en",
  });

  if (!parsed.success) {
    return authErrorState("Revisa tu perfil antes de continuar.");
  }

  try {
    const context = await requireUser();

    await context.data.services.profiles
      .completeOnboarding(context.user.id, parsed.data)
      .catch(async (error: unknown) => {
        if (error instanceof NotFoundError) {
          return context.data.services.profiles.createProfile({
            id: context.user.id,
            ...parsed.data,
            onboardingCompleted: true,
          });
        }

        throw error;
      });

    revalidatePath("/");
    revalidatePath("/profile");
  } catch (error) {
    return authErrorState(friendlyAuthError(error));
  }

  redirect(safeReturnTo(formData.get("returnTo") ?? "/"));
}
