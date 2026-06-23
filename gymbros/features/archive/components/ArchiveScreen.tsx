import Link from "next/link";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatBlock } from "@/components/ui/StatBlock";
import { DomainCommitCard } from "@/features/shared";
import type { JourneyItem, ProgressSummary } from "@/lib/dal";

type ArchiveScreenProps = {
  journey: JourneyItem[];
  progress: ProgressSummary;
};

export function ArchiveScreen({ journey, progress }: ArchiveScreenProps) {
  if (journey.length === 0) {
    return (
      <AppCard className="flex min-h-[22rem] flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Archivo vacio
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-primary-text">
            Tu archivo esta esperando.
          </h2>
          <p className="mt-3 text-sm leading-6 text-secondary-text">
            La proxima sesion que guardes sera tu primera pieza de evidencia.
          </p>
        </div>
        <Link href="/commit">
          <AppButton className="mt-8 w-full">Crear primer Commit</AppButton>
        </Link>
      </AppCard>
    );
  }

  return (
    <>
      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Resumen de evidencia
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatBlock label="Commits totales" value={progress.totalCommits} />
          <StatBlock label="Dias activos" value={progress.activeDays} />
          <StatBlock
            label="Ultimo Commit"
            value={progress.lastCommitAt ? "Activo" : "Sin datos"}
          />
        </div>
      </AppCard>

      <div className="mt-2 flex flex-col gap-4">
        {journey.map((commit) => (
          <DomainCommitCard commit={commit} key={commit.id} />
        ))}
      </div>
    </>
  );
}
