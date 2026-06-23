import "server-only";

import { requireProfile } from "@/lib/auth/session";

export async function getCircleViewModel() {
  const context = await requireProfile();

  const [memberships, presence, recentSupports] = await Promise.all([
    context.data.services.circle.listCircle(context.profile.id),
    context.data.services.circle.getCirclePresence(context.profile.id),
    context.data.services.circle.listRecentSupportsForProfile(
      context.profile.id,
      6
    ),
  ]);

  const profiles = await context.data.services.profiles.listProfilesByIds(
    memberships.map((membership) => membership.circleUserId)
  );
  const profilesById = new Map(
    profiles.map((profile) => [profile.id, profile] as const)
  );

  return {
    status: "ready" as const,
    currentProfileId: context.profile.id,
    memberships,
    memberProfiles: memberships.map((membership) => ({
      membership,
      profile: profilesById.get(membership.circleUserId) ?? null,
    })),
    presence,
    recentSupports,
  };
}
