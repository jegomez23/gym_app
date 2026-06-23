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
      <AppCard className="flex min-h-88 flex-col justify-between" level="hero">
        <div>
          <p className="text-label uppercase text-accent">Archivo vacío</p>
          <h2 className="mt-4 text-title text-primary-text">
            Tu archivo está esperando.
          </h2>
          <p className="mt-3 text-body text-secondary-text">
            La próxima sesión que guardes será tu primera pieza de evidencia.
          </p>
        </div>
        <Link href="/commit">
          <AppButton className="mt-8 w-full">
            Dejar mi primera evidencia
          </AppButton>
        </Link>
      </AppCard>
    );
  }

  return (
    <>
      <AppCard level="hero">
        <p className="text-label uppercase text-secondary-text">
          Lo que has construido
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatBlock label="Evidencias" value={progress.totalCommits} />
          <StatBlock
            label="Sigues presente"
            value={progress.lastCommitAt ? "Sí" : "Aún no"}
          />
        </div>
      </AppCard>

      {journey.map((commit) => (
        <DomainCommitCard commit={commit} key={commit.id} />
      ))}
    </>
  );
}
