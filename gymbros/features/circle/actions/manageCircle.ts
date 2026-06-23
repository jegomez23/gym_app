"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionState } from "@/features/shared/actionState";
import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";
import { requireProfile } from "@/lib/auth/session";

const inviteSchema = z.object({
  username: z.string().trim().min(3).max(30),
});

const memberSchema = z.object({
  memberId: z.string().uuid(),
});

function revalidateCircleSurfaces() {
  revalidatePath("/");
  revalidatePath("/circle");
  revalidatePath("/profile");
}

export async function inviteCircleMemberAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = inviteSchema.safeParse({
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Escribe un username valido para invitar.",
    };
  }

  try {
    const context = await requireProfile();
    await context.data.services.circle.inviteCircleMember(context.profile.id, {
      username: parsed.data.username,
    });
    revalidateCircleSurfaces();

    return actionSuccessState("Invitacion enviada.");
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function acceptCircleInvitationAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = memberSchema.safeParse({
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No pudimos identificar esa invitacion.",
    };
  }

  try {
    const context = await requireProfile();
    await context.data.services.circle.acceptInvitation(
      context.profile.id,
      parsed.data.memberId
    );
    revalidateCircleSurfaces();

    return actionSuccessState("Invitacion aceptada.");
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function rejectCircleInvitationAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = memberSchema.safeParse({
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No pudimos identificar esa invitacion.",
    };
  }

  try {
    const context = await requireProfile();
    await context.data.services.circle.rejectInvitation(
      context.profile.id,
      parsed.data.memberId
    );
    revalidateCircleSurfaces();

    return actionSuccessState("Invitacion rechazada.");
  } catch (error) {
    return actionErrorState(error);
  }
}

export async function leaveCircleAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = memberSchema.safeParse({
    memberId: formData.get("memberId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "No pudimos identificar ese miembro.",
    };
  }

  try {
    const context = await requireProfile();
    await context.data.services.circle.removeMember(
      context.profile.id,
      parsed.data.memberId
    );
    revalidateCircleSurfaces();

    return actionSuccessState("Has salido de esa relacion.");
  } catch (error) {
    return actionErrorState(error);
  }
}
