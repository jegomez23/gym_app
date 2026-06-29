import "server-only";

import { requireProfile } from "@/lib/auth/session";
import { selectMemory } from "@/lib/memory/selectMemory";
import { describeCadence } from "@/lib/process/describeCadence";

export async function getProfileViewModel() {
  const context = await requireProfile();

  // A profile is identity, not settings: it should answer "who is this person?".
  // The truest answer the architecture already holds is the life they are building —
  // their own evidence and its rhythm — never a statistic. Reuse the journey the
  // Archive already reads (a small recent glimpse here, not the full record) and the
  // same cadence sentence. The oldest reflections feed the Memory Selection Engine's
  // Profile origin (Policy v2) — the user's own beginning, returned on their mirror.
  const [evidence, progress, oldestReflections] = await Promise.all([
    context.data.services.journey.getJourney(context.profile.id, { limit: 5 }),
    context.data.services.journey.getProgressSummary(context.profile.id),
    context.data.services.reflections.listOldestForProfile(
      context.profile.id,
      12
    ),
  ]);

  const cadence = describeCadence({
    totalCommits: progress.totalCommits,
    activeDays: progress.activeDays,
    firstCommitAt: progress.firstCommitAt,
  });

  // The mirror remembers: one of the user's oldest words, if any has aged into an
  // origin. A pull surface — no ledger needed. Silence is the default (most profiles
  // return null until a reflection has earned distance). The vow already on the hero
  // is excluded so memory never echoes it.
  const memory = selectMemory({
    context: "profile",
    identityStatement: context.profile.identityStatement,
    reflections: oldestReflections.map((reflection) => ({
      content: reflection.content,
      type: reflection.type,
      createdAt: reflection.createdAt,
    })),
  });

  return {
    status: "ready" as const,
    profile: context.profile,
    evidence,
    cadence,
    memory,
  };
}
