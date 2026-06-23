import { AuthFormShell } from "@/features/auth/components/AuthFormShell";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { safeReturnTo } from "@/lib/auth/routes";

type LoginPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthFormShell
      eyebrow="Acceso"
      footerHref="/signup"
      footerLabel="Crear cuenta"
      footerText="No tienes cuenta?"
      subtitle="Entra con email y contrasena para volver a tu evidencia."
      title="Volver al circulo."
    >
      <LoginForm returnTo={safeReturnTo(params.returnTo ?? "/")} />
    </AuthFormShell>
  );
}
