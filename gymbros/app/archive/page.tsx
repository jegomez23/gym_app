"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatBlock } from "@/components/ui/StatBlock";
import { CommitCard } from "@/components/gym/CommitCard";
import {
  getCommitsThisWeek,
  getLatestFeeling,
  sortCommitsNewestFirst,
} from "@/lib/utils/archive";
import { getFeelingLabel } from "@/lib/utils/labels";
import { useCommitStore } from "@/store/useCommitStore";

export default function ArchivePage() {
  const router = useRouter();
  const commits = useCommitStore((state) => state.commits);
  const sortedCommits = sortCommitsNewestFirst(commits);
  const commitsThisWeek = getCommitsThisWeek(commits);
  const latestFeeling = getFeelingLabel(getLatestFeeling(sortedCommits));

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Archivo personal"
        subtitle="Cada sesión guardada es una prueba de que estás construyendo constancia."
        title="Tu evidencia vive aquí."
      >
        {sortedCommits.length > 0 ? (
          <>
            <AppCard>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                Resumen de evidencia
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatBlock label="Commits totales" value={sortedCommits.length} />
                <StatBlock
                  label="Esta semana"
                  value={commitsThisWeek.length}
                />
                <StatBlock label="Sensación más reciente" value={latestFeeling} />
              </div>
            </AppCard>

            <div className="mt-2 flex flex-col gap-4">
              {sortedCommits.map((commit) => (
                <CommitCard commit={commit} key={commit.id} />
              ))}
            </div>
          </>
        ) : (
          <AppCard className="flex min-h-[22rem] flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Archivo vacío
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-primary-text">
                Tu archivo está esperando.
              </h2>
              <p className="mt-3 text-sm leading-6 text-secondary-text">
                La próxima sesión que guardes será tu primera pieza de
                evidencia.
              </p>
            </div>
            <AppButton
              className="mt-8 w-full"
              onClick={() => router.push("/commit")}
            >
              Crear primer Commit
            </AppButton>
          </AppCard>
        )}
      </ScreenContainer>
    </AppShell>
  );
}
