import Link from "next/link";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { DomainCommitCard } from "@/features/shared";
import type { JourneyItem } from "@/lib/dal";

type ArchiveScreenProps = {
  journey: JourneyItem[];
};

export function ArchiveScreen({ journey }: ArchiveScreenProps) {
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
      {journey.map((commit) => (
        <DomainCommitCard commit={commit} key={commit.id} />
      ))}
    </>
  );
}
