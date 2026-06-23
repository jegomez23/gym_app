import "server-only";

import { requireProfile } from "@/lib/auth/session";

export async function getProfileViewModel() {
  const context = await requireProfile();

  const [progress, memberships, presence] = await Promise.all([
    context.data.services.journey.getProgressSummary(context.profile.id),
    context.data.services.circle.listCircle(context.profile.id),
    context.data.services.circle.getCirclePresence(context.profile.id),
  ]);

  return {
    status: "ready" as const,
    profile: context.profile,
    progress,
    memberships,
    presence,
  };
}
