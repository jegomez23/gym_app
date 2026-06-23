import "server-only";

import { redirect } from "next/navigation";

import { getUserContext } from "@/lib/auth/session";

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
  ]);

  return {
    status: "ready" as const,
    profile,
    commits,
    progress,
    presence,
    memberships,
    recentSupports,
    notifications,
  };
}
