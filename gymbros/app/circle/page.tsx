import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { CircleScreen } from "@/features/circle/components/CircleScreen";
import { getCircleViewModel } from "@/features/circle/queries";

export const dynamic = "force-dynamic";

export default async function CirclePage() {
  const viewModel = await getCircleViewModel();

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Circulo Privado"
        subtitle="Un espacio privado para sostenerte sin tener que aparentar."
        title="Tu circulo esta en silencio, pero presente."
      >
        <CircleScreen
          currentProfileId={viewModel.currentProfileId}
          memberProfiles={viewModel.memberProfiles}
          memberships={viewModel.memberships}
          presence={viewModel.presence}
          recentSupports={viewModel.recentSupports}
        />
      </ScreenContainer>
    </AppShell>
  );
}
