import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { CommitFlowClient } from "@/features/commit";
import { requireProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CommitFlowPage() {
  const { profile, data } = await requireProfile();

  // Surface the user's most recent reflection as memory, not history.
  const journey = await data.services.journey
    .getJourney(profile.id, { limit: 5 })
    .catch(() => []);
  const lastReflection =
    journey
      .flatMap((item) => item.reflections)
      .map((reflection) => reflection.content)
      .find((content) => content.trim().length > 0) ?? null;

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Un momento contigo"
        subtitle="Convierte lo que hiciste en evidencia de quien estás siendo."
        title="Aparece hoy"
      >
        <CommitFlowClient lastReflection={lastReflection} name={profile.name} />
      </ScreenContainer>
    </AppShell>
  );
}
