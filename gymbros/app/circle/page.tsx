"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { CircleActivityItem } from "@/components/gym/CircleActivityItem";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatBlock } from "@/components/ui/StatBlock";
import { getCircleCommitsThisWeek } from "@/lib/utils/circle";
import { getCircleNameLabel } from "@/lib/utils/labels";
import { useCircleStore } from "@/store/useCircleStore";

export default function CirclePage() {
  const router = useRouter();
  const {
    activity,
    circleName,
    members,
    reactions,
    setReaction,
    trainedTodayCount,
  } = useCircleStore();
  const sortedActivity = [...activity].sort(
    (first, second) =>
      new Date(second.committedAt).getTime() -
      new Date(first.committedAt).getTime()
  );
  const commitsThisWeek = getCircleCommitsThisWeek(activity);

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Círculo Privado"
        subtitle="Un espacio privado para sostenerte sin tener que aparentar."
        title="Tu círculo está en silencio, pero presente."
      >
        {sortedActivity.length > 0 ? (
          <>
            <AppCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                    Círculo
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-primary-text">
                    {getCircleNameLabel(circleName)}
                  </h2>
                </div>
                <span className="rounded-full border border-[var(--accent-border)] px-4 py-2 text-xs font-semibold text-accent">
                  Privado
                </span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatBlock label="Miembros" value={members.length} />
                <StatBlock label="Entrenaron hoy" value={trainedTodayCount} />
                <StatBlock
                  label="Commits esta semana"
                  value={commitsThisWeek.length}
                />
              </div>
            </AppCard>

            <section className="mt-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                Actividad reciente
              </p>
              <div className="flex flex-col gap-3">
                {sortedActivity.map((item) => (
                  <CircleActivityItem
                    activity={item}
                    key={item.id}
                    onReact={setReaction}
                    selectedReaction={reactions[item.id]}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <AppCard className="flex min-h-[22rem] flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Día silencioso
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-primary-text">
                El círculo está en silencio hoy.
              </h2>
              <p className="mt-3 text-sm leading-6 text-secondary-text">
                Sin presión. El próximo Commit puede reiniciar el ritmo.
              </p>
            </div>
            <AppButton
              className="mt-8 w-full"
              onClick={() => router.push("/commit")}
            >
              Crear Commit
            </AppButton>
          </AppCard>
        )}
      </ScreenContainer>
    </AppShell>
  );
}
