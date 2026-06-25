import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { StateMessage } from "@/features/shared";
import { TodayScreen } from "@/features/today/components/TodayScreen";
import { getTodayViewModel } from "@/features/today/queries";

export const dynamic = "force-dynamic";

export default async function TodayHubPage() {
  const viewModel = await getTodayViewModel();

  return (
    <AppShell>
      <ScreenContainer eyebrow="GYM CIRCLE" title="Hoy">
        {viewModel.status === "ready" ? (
          <TodayScreen
            commits={viewModel.commits}
            memberships={viewModel.memberships}
            memory={viewModel.memory}
            notifications={viewModel.notifications}
            presence={viewModel.presence}
            profile={viewModel.profile}
            recentSupports={viewModel.recentSupports}
            sharedPresence={viewModel.sharedPresence}
            state={viewModel.state}
          />
        ) : (
          <StateMessage
            actionHref="/login"
            actionLabel="Entrar"
            eyebrow="Tu evidencia te espera"
            message={viewModel.message}
            title="Entra para recordar quién estás siendo."
          />
        )}
      </ScreenContainer>
    </AppShell>
  );
}
