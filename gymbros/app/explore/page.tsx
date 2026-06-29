import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ExploreScreen } from "@/features/explore/components/ExploreScreen";
import { getExploreViewModel } from "@/features/explore/queries";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const viewModel = await getExploreViewModel();

  return (
    <AppShell>
      <ScreenContainer eyebrow="Explorar" title="La práctica de otros.">
        <ExploreScreen documents={viewModel.documents} />
      </ScreenContainer>
    </AppShell>
  );
}
