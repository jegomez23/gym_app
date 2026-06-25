import "server-only";

import { requireProfile } from "@/lib/auth/session";
import { describeCadence } from "@/lib/process/describeCadence";

export async function getArchiveViewModel() {
  const context = await requireProfile();

  const [journey, progress] = await Promise.all([
    context.data.services.journey.getJourney(context.profile.id, {
      limit: 30,
    }),
    context.data.services.journey.getProgressSummary(context.profile.id),
  ]);

  // The one quiet signal of process: what this evidence reveals about the rhythm
  // of the practice — in words, never a number. Null (silence) until honest.
  const cadence = describeCadence({
    totalCommits: progress.totalCommits,
    activeDays: progress.activeDays,
    firstCommitAt: progress.firstCommitAt,
  });

  return {
    status: "ready" as const,
    journey,
    cadence,
  };
}
