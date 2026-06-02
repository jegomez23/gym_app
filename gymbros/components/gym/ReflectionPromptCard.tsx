import { AppCard } from "@/components/ui/AppCard";

export function ReflectionPromptCard() {
  return (
    <AppCard className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
        Reflexión
      </p>
      <h2 className="mt-3 text-xl font-semibold text-primary-text">
        Una nota para tu yo del futuro
      </h2>
      <p className="mt-2 text-sm leading-6 text-secondary-text">
        ¿Qué significó aparecer hoy?
      </p>
      <p className="mt-5 text-sm font-medium text-accent">
        Responde después de registrar
      </p>
    </AppCard>
  );
}
