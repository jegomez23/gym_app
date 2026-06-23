import type { AuthContext, ProfileContext } from "./session";

export function canViewCommit(
  viewer: ProfileContext,
  commit: { userId: string; visibility: "private" | "circle" | "public" }
) {
  if (commit.userId === viewer.profile.id) {
    return true;
  }

  if (commit.visibility === "public") {
    return true;
  }

  return commit.visibility === "circle";
}

export async function canSupport(
  context: AuthContext,
  targetProfileId: string
) {
  if (context.user.id === targetProfileId) {
    return false;
  }

  const memberships = await context.data.services.circle.listCircle(
    context.user.id
  );

  return memberships.some(
    (membership) =>
      membership.circleUserId === targetProfileId &&
      membership.status === "active" &&
      !membership.deletedAt
  );
}

export function canJoinCircle(
  context: ProfileContext,
  targetProfileId: string
) {
  return context.profile.id !== targetProfileId && !context.profile.deletedAt;
}
