"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionErrorState,
  actionSuccessState,
} from "@/features/shared/server/actionResult";
import type { ActionState } from "@/features/shared/actionState";
import { requireProfile } from "@/lib/auth/session";

const formSchema = z.object({
  title: z.string().trim().min(1).max(150),
  type: z.string().trim().min(1).max(50).nullable(),
  durationMinutes: z.coerce.number().int().positive().nullable(),
  intensity: z.enum(["light", "steady", "deep"]).nullable(),
  note: z.string().trim().max(500).nullable(),
  reflectionContent: z.string().trim().max(300).nullable(),
  reflectionType: z
    .enum(["technical", "emotional", "identity", "process"])
    .nullable(),
  visibility: z.enum(["private", "circle", "public"]),
});

function nullableText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function publishCommitAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const context = await requireProfile();
    const parsed = formSchema.parse({
      title: formData.get("title"),
      type: nullableText(formData.get("type")),
      durationMinutes: nullableText(formData.get("durationMinutes")),
      intensity: nullableText(formData.get("intensity")),
      note: nullableText(formData.get("note")),
      reflectionContent: nullableText(formData.get("reflectionContent")),
      reflectionType: nullableText(formData.get("reflectionType")),
      visibility: formData.get("visibility") ?? "private",
    });

    await context.data.services.commits.publishCommitWithReflection(
      context.profile.id,
      {
        title: parsed.title,
        type: parsed.type,
        durationMinutes: parsed.durationMinutes,
        intensity: parsed.intensity,
        note: parsed.note,
        visibility: parsed.visibility,
        reflectionContent: parsed.reflectionContent,
        reflectionType: parsed.reflectionType,
      }
    );

    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/circle");
    revalidatePath("/profile");

    return actionSuccessState("Commit guardado. Hoy apareciste.");
  } catch (error) {
    return actionErrorState(error);
  }
}
