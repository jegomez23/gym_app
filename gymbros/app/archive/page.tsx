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
        subtitle="Cada sesion guardada es una prueba de que estas construyendo constancia."
        title="Tu evidencia vive aqui."
      >
        <ArchiveScreen
          journey={viewModel.journey}
          progress={viewModel.progress}
        />
      </ScreenContainer>
    </AppShell>
  );
}
