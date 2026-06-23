import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { CommitFlowClient } from "@/features/commit";
import { requireProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CommitFlowPage() {
  await requireProfile();

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Flujo de Commit"
        subtitle="Un ritual privado para convertir la sesion en evidencia."
        title="Registrar sesion"
      >
        <CommitFlowClient />
      </ScreenContainer>
    </AppShell>
  );
}
