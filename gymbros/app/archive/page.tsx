import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ArchiveScreen } from "@/features/archive/components/ArchiveScreen";
import { getArchiveViewModel } from "@/features/archive/queries";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const viewModel = await getArchiveViewModel();

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Archivo personal"
        subtitle="Cada evidencia guardada es una prueba de quién estás siendo."
        title="Tu evidencia vive aquí."
      >
        <ArchiveScreen
          journey={viewModel.journey}
          progress={viewModel.progress}
        />
      </ScreenContainer>
    </AppShell>
  );
}
