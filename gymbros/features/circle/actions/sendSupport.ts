"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";
import type { ActionState } from "@/features/shared/actionState";
import { requireProfile } from "@/lib/auth/session";

const supportFormSchema = z.object({
  toUserId: z.string().uuid(),
  message: z.string().trim().min(1).max(200),
});

export async function sendSupportAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = supportFormSchema.safeParse({
    toUserId: formData.get("toUserId"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa el mensaje de apoyo antes de enviarlo.",
    };
  }

  try {
    const context = await requireProfile();

    await context.data.services.circle.sendSupport(
      context.profile.id,
      parsed.data
    );
    revalidatePath("/circle");
    revalidatePath("/profile");

    return actionSuccessState("Apoyo enviado.");
  } catch (error) {
    return actionErrorState(error);
  }
}
