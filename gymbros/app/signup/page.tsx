import { AuthFormShell } from "@/features/auth/components/AuthFormShell";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthFormShell
      eyebrow="Nueva cuenta"
      footerHref="/login"
      footerLabel="Entrar"
      footerText="Ya tienes cuenta?"
      subtitle="Crea tu acceso privado. El perfil se completa en el siguiente paso."
      title="Empieza sin ruido."
    >
      <SignupForm />
    </AuthFormShell>
  );
}
