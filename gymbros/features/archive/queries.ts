import "server-only";

import { requireProfile } from "@/lib/auth/session";

export async function getArchiveViewModel() {
  const context = await requireProfile();

  const [journey, progress] = await Promise.all([
    context.data.services.journey.getJourney(context.profile.id, {
      limit: 30,
    }),
    context.data.services.journey.getProgressSummary(context.profile.id),
  ]);

  return {
    status: "ready" as const,
    journey,
    progress,
  };
}
