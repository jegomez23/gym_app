import { AppCard } from "@/components/ui/AppCard";

export function ChapterCard() {
  return (
    <AppCard className="relative overflow-hidden">
      <div className="absolute -right-8 top-8 h-24 w-24 rounded-full bg-[var(--accent-soft)] blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Capítulo actual
            </p>
            <p className="mt-3 text-sm font-medium text-accent">
              Invierno 2026
            </p>
          </div>
          <span className="rounded-full border border-[var(--accent-border)] px-3 py-1 text-xs font-semibold text-accent">
            Día 12 de 90
          </span>
        </div>
        <h2 className="mt-5 text-2xl font-semibold leading-tight text-primary-text">
          Construyendo la base
        </h2>
        <p className="mt-3 max-w-[20rem] text-sm leading-6 text-secondary-text">
          Esta temporada se trata de volver, reconstruir y proteger el ritmo.
        </p>
      </div>
    </AppCard>
  );
}
