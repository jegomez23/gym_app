import "server-only";

import { requireProfile } from "@/lib/auth/session";
import { describeCadence } from "@/lib/process/describeCadence";

export async function getProfileViewModel() {
  const context = await requireProfile();

  // A profile is identity, not settings: it should answer "who is this person?".
  // The truest answer the architecture already holds is the life they are building —
  // their own evidence and its rhythm — never a statistic. Reuse the journey the
  // Archive already reads (a small recent glimpse here, not the full record) and the
  // same cadence sentence. No new entity, no new query, no new table.
  const [evidence, progress] = await Promise.all([
    context.data.services.journey.getJourney(context.profile.id, { limit: 5 }),
    context.data.services.journey.getProgressSummary(context.profile.id),
  ]);

  const cadence = describeCadence({
    totalCommits: progress.totalCommits,
    activeDays: progress.activeDays,
    firstCommitAt: progress.firstCommitAt,
  });

  return {
    status: "ready" as const,
    profile: context.profile,
    evidence,
    cadence,
  };
}
