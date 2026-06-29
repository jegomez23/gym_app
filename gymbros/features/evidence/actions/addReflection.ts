"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { friendlyAuthError } from "@/lib/auth";
import { requireProfile } from "@/lib/auth/session";
import type { ActionState } from "@/features/shared/actionState";
import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";

const formSchema = z.object({
  commitId: z.string().uuid(),
  content: z.string().trim().min(1).max(300),
});

/**
 * Add to an existing document, after the fact. This is what turns a piece of
 * evidence from a record into a living document: an experience can be written
 * about days later (a lesson from a hike, what a race felt like in hindsight).
 * It is the reason to open the app on a day with no new evidence to leave.
 *
 * Ownership is enforced by RLS (`reflections_insert_own` requires the commit to
 * belong to the author); the form only renders for the owner as defense in depth.
 */
export async function addReflectionAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = formSchema.safeParse({
    commitId: formData.get("commitId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return actionErrorState("Escribe algo antes de guardar.");
  }

  try {
    const context = await requireProfile();
    await context.data.services.commits.createReflection(context.profile.id, {
      commitId: parsed.data.commitId,
      content: parsed.data.content,
      // A note written about a past experience is for the person themselves.
      type: "process",
      visibility: "private",
    });

    revalidatePath(`/evidence/${parsed.data.commitId}`);
    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/profile");

    return actionSuccessState("Lo guardaste.");
  } catch (error) {
    return actionErrorState(friendlyAuthError(error));
  }
}
