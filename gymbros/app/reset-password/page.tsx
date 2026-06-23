import { AuthFormShell } from "@/features/auth/components/AuthFormShell";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthFormShell
      eyebrow="Nueva contrasena"
      subtitle="Elige una contrasena nueva para proteger tu cuenta."
      title="Actualizar acceso."
    >
      <ResetPasswordForm />
    </AuthFormShell>
  );
}
