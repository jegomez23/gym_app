"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { MomentumCard } from "@/components/gym/MomentumCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatBlock } from "@/components/ui/StatBlock";
import { getCommitsThisWeek, getLatestFeeling } from "@/lib/utils/archive";
import { getCircleNameLabel, getFeelingLabel } from "@/lib/utils/labels";
import { getMomentumMessage } from "@/lib/utils/momentum";
import { useCircleStore } from "@/store/useCircleStore";
import { useCommitStore } from "@/store/useCommitStore";

const mockUser = {
  name: "Alex Rivera",
  initials: "AR",
  identity: "Estoy construyendo disciplina, una sesión a la vez.",
  buildingSince: "Construyendo desde enero de 2026",
};

const productPrinciples = [
  "Sin feed público",
  "Sin métricas de vanidad",
  "Sin comparación corporal",
  "Evidencia sobre obsesión",
];

export default function ProfilePage() {
  const { commits, momentum } = useCommitStore();
  const { circleName, members, trainedTodayCount } = useCircleStore();
  const commitsThisWeek = getCommitsThisWeek(commits);
  const latestFeeling = getFeelingLabel(getLatestFeeling(commits));

  return (
    <AppShell>
      <ScreenContainer
        eyebrow="Perfil"
        subtitle="Es un registro silencioso de quien te estás convirtiendo."
        title="Esto no es un perfil fitness."
      >
        <AppCard>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg font-semibold text-accent">
              {mockUser.initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary-text">
                {mockUser.name}
              </h2>
              <p className="mt-1 text-sm text-secondary-text">
                {mockUser.buildingSince}
              </p>
            </div>
          </div>
          <p className="mt-5 text-base leading-7 text-primary-text">
            {mockUser.identity}
          </p>
        </AppCard>

        <MomentumCard
          message={getMomentumMessage(momentum)}
          momentum={momentum}
        />

        <AppCard>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Resumen de disciplina
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatBlock label="Commits totales" value={commits.length} />
            <StatBlock label="Esta semana" value={commitsThisWeek.length} />
            <StatBlock label="Sensación más reciente" value={latestFeeling} />
          </div>
        </AppCard>

        <AppCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
                Círculo privado
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-primary-text">
                {getCircleNameLabel(circleName)}
              </h2>
            </div>
            <span className="rounded-full border border-[var(--accent-border)] px-4 py-2 text-xs font-semibold text-accent">
              Privado
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatBlock label="Miembros" value={members.length} />
            <StatBlock label="Entrenaron hoy" value={trainedTodayCount} />
          </div>
        </AppCard>

        <AppCard>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Principios del producto
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {productPrinciples.map((principle) => (
              <li
                className="flex items-center gap-3 text-sm text-primary-text"
                key={principle}
              >
                <span className="h-2 w-2 rounded-full bg-accent" />
                {principle}
              </li>
            ))}
          </ul>
          <AppButton className="mt-6 w-full" disabled variant="secondary">
            Edición de perfil no habilitada
          </AppButton>
        </AppCard>
      </ScreenContainer>
    </AppShell>
  );
}
