import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ProfileScreen } from "@/features/profile/components/ProfileScreen";
import { getProfileViewModel } from "@/features/profile/queries";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const viewModel = await getProfileViewModel();

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Perfil"
        subtitle="Es un registro silencioso de quien te estas convirtiendo."
        title="Esto no es un perfil fitness."
      >
        <ProfileScreen
          memberships={viewModel.memberships}
          presence={viewModel.presence}
          profile={viewModel.profile}
          progress={viewModel.progress}
        />
      </ScreenContainer>
    </AppShell>
  );
}
