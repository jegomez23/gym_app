import "server-only";

import { redirect } from "next/navigation";

import { getUserContext } from "@/lib/auth/session";
import { deriveState } from "@/lib/state/deriveState";

export async function getTodayViewModel() {
  const context = await getUserContext().catch(() => null);

  if (!context) {
    return {
      status: "anonymous" as const,
      message: "Inicia sesion para cargar tus datos reales de Gym Circle.",
    };
  }

  const profile = await context.data.services.profiles
    .findProfile(context.user.id)
    .catch(() => null);

  if (!profile || !profile.onboardingCompleted || profile.deletedAt) {
    redirect("/onboarding");
  }

  const [
    commits,
    progress,
    presence,
    memberships,
    recentSupports,
    notifications,
    journey,
  ] = await Promise.all([
    context.data.services.commits.listCommitsForProfile(profile.id, {
      limit: 4,
    }),
    context.data.services.journey.getProgressSummary(profile.id),
    context.data.services.circle.getCirclePresence(profile.id),
    context.data.services.circle.listCircle(profile.id),
    context.data.services.circle.listRecentSupportsForProfile(profile.id, 5),
    context.data.services.notifications.listNotifications(profile.id, {
      limit: 5,
    }),
    // Same Journey read Archive uses — gives the engine the user's reflections
    // (with type) so Protected is derivable from their own words.
    context.data.services.journey.getJourney(profile.id, { limit: 5 }),
  ]);

  // The single most recent reflection, by the user's own words and their own type.
  const latestReflection =
    journey
      .flatMap((item) => item.reflections)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;

  // The most recent human word the user received (not one they sent).
  const latestSupportReceivedAt =
    recentSupports
      .filter((support) => support.toUserId === profile.id)
      .map((support) => support.createdAt)
      .sort((a, b) => b.localeCompare(a))[0] ?? null;

  // One canonical place derives human state — never JSX, never a component.
  const state = deriveState({
    totalCommits: progress.totalCommits,
    lastCommitAt: progress.lastCommitAt,
    latestReflection: latestReflection
      ? { type: latestReflection.type, createdAt: latestReflection.createdAt }
      : null,
    latestSupportReceivedAt,
  });

  return {
    status: "ready" as const,
    profile,
    commits,
    progress,
    presence,
    memberships,
    recentSupports,
    notifications,
    state,
  };
}
