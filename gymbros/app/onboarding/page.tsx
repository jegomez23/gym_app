import { redirect } from "next/navigation";

import { AuthFormShell } from "@/features/auth/components/AuthFormShell";
import { OnboardingForm } from "@/features/onboarding/components/OnboardingForm";
import { getUserContext } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const context = await getUserContext();
  const params = await searchParams;

  if (!context) {
    redirect("/login?returnTo=/onboarding");
  }

  const profile = await context.data.services.profiles
    .findProfile(context.user.id)
    .catch(() => null);

  if (profile?.onboardingCompleted && !profile.deletedAt) {
    redirect(params.returnTo ?? "/");
  }

  return (
    <AuthFormShell
      eyebrow="Onboarding"
      subtitle="Define tu identidad privada antes de empezar."
      title="Crea tu perfil."
    >
      <OnboardingForm
        defaultLocale="es"
        defaultName={profile?.name ?? context.user.email?.split("@")[0] ?? ""}
        defaultTimezone="UTC"
        returnTo={params.returnTo ?? "/"}
      />
    </AuthFormShell>
  );
}
