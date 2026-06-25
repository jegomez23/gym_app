import "server-only";

import { redirect } from "next/navigation";

import { getUserContext } from "@/lib/auth/session";
import { selectMemory } from "@/lib/memory/selectMemory";
import { deriveSharedPresence } from "@/lib/presence/deriveSharedPresence";
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
      limit: 8,
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

  // The Memory Selection Engine decides whether one of the user's own past
  // reflections returns at this moment — silence unless the gates pass. The
  // candidate pool is the same Journey window already loaded above (no new read).
  const memory = selectMemory({
    state: state.state,
    reflections: journey
      .flatMap((item) => item.reflections)
      .map((reflection) => ({
        content: reflection.content,
        type: reflection.type,
        createdAt: reflection.createdAt,
      })),
  });

  // Shared presence (Phase 42): proposals ride the notifications carrier, and
  // whether both people appeared is derived from commit evidence already loaded.
  // Partner last-commit and names come from circle presence — no new read.
  const partnerLastCommitAt: Record<string, string | null> = {};
  const partnerName: Record<string, string> = {};
  for (const member of presence) {
    partnerLastCommitAt[member.memberId] = member.lastCommitRecordedAt;
    partnerName[member.memberId] = member.memberName;
  }

  const sharedPresence = deriveSharedPresence({
    proposals: notifications
      .filter((notification) => notification.type === "shared_presence")
      .map((notification) => ({
        notificationId: notification.id,
        partnerId: notification.actorUserId ?? "",
        partnerName:
          partnerName[notification.actorUserId ?? ""] ?? "tu círculo",
        accepted: notification.readAt !== null,
        createdAt: notification.createdAt,
      })),
    selfLastCommitAt: progress.lastCommitAt,
    partnerLastCommitAt,
  });

  // Shared-presence proposals have their own calm surface; keep them out of the
  // generic notifications panel so they are never double-rendered.
  const generalNotifications = notifications.filter(
    (notification) => notification.type !== "shared_presence"
  );

  return {
    status: "ready" as const,
    profile,
    commits,
    progress,
    presence,
    memberships,
    recentSupports,
    notifications: generalNotifications,
    sharedPresence,
    state,
    memory,
  };
}
