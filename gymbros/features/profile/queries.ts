import "server-only";

import { requireProfile } from "@/lib/auth/session";

export async function getProfileViewModel() {
  const context = await requireProfile();

  return {
    status: "ready" as const,
    profile: context.profile,
  };
}
