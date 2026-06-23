import { AuthFormShell } from "@/features/auth/components/AuthFormShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      eyebrow="Recuperacion"
      footerHref="/login"
      footerLabel="Volver al login"
      footerText="Recordaste tu acceso?"
      subtitle="Te enviaremos un enlace para crear una nueva contrasena."
      title="Recuperar acceso."
    >
      <ForgotPasswordForm />
    </AuthFormShell>
  );
}
