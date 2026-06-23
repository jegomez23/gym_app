"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionState } from "@/features/shared/actionState";
import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";
import { requireProfile } from "@/lib/auth/session";

const notificationSchema = z.object({
  notificationId: z.string().uuid(),
});

export async function markNotificationReadAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = notificationSchema.safeParse({
    notificationId: formData.get("notificationId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No pudimos identificar la notificacion.",
    };
  }

  try {
    const context = await requireProfile();
    await context.data.services.notifications.markNotificationRead(
      context.profile.id,
      parsed.data.notificationId
    );
    revalidatePath("/");
    revalidatePath("/circle");

    return actionSuccessState("Notificacion marcada como leida.");
  } catch (error) {
    return actionErrorState(error);
  }
}
