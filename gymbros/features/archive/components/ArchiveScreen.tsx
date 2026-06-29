import Link from "next/link";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { DomainCommitCard } from "@/features/shared";

import type { ArchiveSeason } from "../queries";

type ArchiveScreenProps = {
  // The record told as the seasons it was lived in — a chapter and the evidence
  // made within it. Replaces the flat stream.
  seasons: ArchiveSeason[];
  // One quiet sentence on the rhythm of the practice, or null when there is no
  // honest cadence to claim yet. Context, never a headline.
  cadence: string | null;
};

export function ArchiveScreen({ seasons, cadence }: ArchiveScreenProps) {
  const isEmpty = seasons.every((season) => season.items.length === 0);

  if (isEmpty) {
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
      {cadence && (
        // The practice speaking quietly about itself, above the evidence it is
        // made of. No card, no number, no emphasis — just context.
        <p className="px-1 text-body leading-7 text-secondary-text">
          {cadence}
        </p>
      )}
      {seasons.map((season, index) => (
        <section
          className="flex flex-col gap-4"
          key={`${season.chapter ?? "sin-capitulo"}-${index}`}
        >
          {/* The season's name, in the user's own words — a quiet divider, not a
              card. Season-less evidence simply has no header. */}
          {season.chapter && (
            <p className="px-1 pt-2 text-label uppercase text-accent">
              {season.chapter}
            </p>
          )}
          {season.items.map((commit) => (
            <DomainCommitCard commit={commit} key={commit.id} />
          ))}
        </section>
      ))}
    </>
  );
}
