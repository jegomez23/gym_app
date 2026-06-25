import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { CommitFlowClient } from "@/features/commit";
import { requireProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CommitFlowPage() {
  const { profile, data } = await requireProfile();

  // Starting evidence is a silent, frictionless moment (Memory Selection Engine
  // Part 4) — no memory is surfaced here. The only thing we read is whether this is
  // the user's first time, so the recognition that follows can tell the truth.
  const progress = await data.services.journey
    .getProgressSummary(profile.id)
    .catch(() => null);
  const isFirstCommit = (progress?.totalCommits ?? 0) === 0;

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Un momento contigo"
        subtitle="Convierte lo que hiciste en evidencia de quien estás siendo."
        title="Aparece hoy"
      >
        <CommitFlowClient
          identityStatement={profile.identityStatement}
          isFirstCommit={isFirstCommit}
          name={profile.name}
        />
      </ScreenContainer>
    </AppShell>
  );
}
