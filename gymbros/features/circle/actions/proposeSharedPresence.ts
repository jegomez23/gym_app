"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";
import type { ActionState } from "@/features/shared/actionState";
import { requireProfile } from "@/lib/auth/session";

const proposeSharedPresenceSchema = z.object({
  partnerId: z.string().uuid(),
});

export async function proposeSharedPresenceAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = proposeSharedPresenceSchema.safeParse({
    partnerId: formData.get("partnerId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No pudimos enviar la invitación.",
    };
  }

  try {
    const context = await requireProfile();

    await context.data.services.circle.proposeSharedPresence(
      context.profile.id,
      parsed.data.partnerId
    );
    revalidatePath("/circle");

    return actionSuccessState("Se lo propusiste. Sin presión.");
  } catch (error) {
    return actionErrorState(error);
  }
}
