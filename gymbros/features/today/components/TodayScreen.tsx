import Link from "next/link";
import { ChapterCard } from "@/components/gym/ChapterCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StatBlock } from "@/components/ui/StatBlock";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import { DomainCommitCard } from "@/features/shared";
import type {
  CircleMembership,
  CirclePresence,
  Commit,
  Notification,
  Profile,
  ProgressSummary,
  Support,
} from "@/lib/dal";

type TodayScreenProps = {
  profile: Profile;
  commits: Commit[];
  progress: ProgressSummary;
  presence: CirclePresence[];
  memberships: CircleMembership[];
  recentSupports: Support[];
  notifications: Notification[];
};

function momentumLabel(progress: ProgressSummary) {
  if (progress.activeDays >= 4) {
    return "En flujo";
  }

  if (progress.activeDays > 0) {
    return "Base estable";
  }

  return "Reinicio";
}

export function TodayScreen({
  profile,
  commits,
  progress,
  presence,
  memberships,
  recentSupports,
  notifications,
}: TodayScreenProps) {
  const latestCommit = commits[0];
  const pendingInvitations = memberships.filter(
    (membership) =>
      membership.status === "pending" && membership.invitedBy !== profile.id
  );

  return (
    <>
      <div className="-mt-2 mb-2 rounded-full border border-white/8 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-secondary-text shadow-[0_14px_45px_rgb(0_0_0/0.24)]">
        {profile.name}, hoy no se trata de hacer mas. Se trata de aparecer con
        intencion.
      </div>

      <ChapterCard />

      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Momento actual
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary-text">
          {momentumLabel(progress)}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatBlock label="Commits" value={progress.totalCommits} />
          <StatBlock label="Dias activos" value={progress.activeDays} />
        </div>
      </AppCard>

      <NotificationsPanel
        notifications={notifications}
        profileId={profile.id}
      />

      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Circulo
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary-text">
          {presence.length} presentes · {pendingInvitations.length} invitaciones
        </h2>
        <p className="mt-3 text-sm leading-6 text-secondary-text">
          La presencia privada se calcula desde commits reales compartidos con
          tu circulo.
        </p>
        {pendingInvitations.length > 0 && (
          <Link className="mt-5 block" href="/circle">
            <AppButton className="w-full" variant="secondary">
              Revisar invitaciones
            </AppButton>
          </Link>
        )}
      </AppCard>

      {latestCommit ? (
        <DomainCommitCard commit={latestCommit} eyebrow="Ultimo Commit" />
      ) : (
        <AppCard>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Archivo vacio
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-primary-text">
            Tu primera evidencia empieza aqui.
          </h2>
          <p className="mt-3 text-sm leading-6 text-secondary-text">
            Registra una sesion para activar el diario y el progreso.
          </p>
        </AppCard>
      )}

      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Apoyos recientes
        </p>
        {recentSupports.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {recentSupports.map((support) => (
              <div
                className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
                key={support.id}
              >
                <p className="text-sm leading-6 text-primary-text">
                  {support.message}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-text">
                  {support.fromUserId === profile.id ? "Enviado" : "Recibido"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-secondary-text">
            Todavia no hay apoyos. Aparecer por otros empieza con un Commit
            compartido.
          </p>
        )}
      </AppCard>

      <AppCard>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Journey
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary-text">
          {progress.firstCommitAt ? "Ya hay historia" : "Aun por empezar"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-secondary-text">
          {progress.firstCommitAt
            ? `Primer Commit: ${new Intl.DateTimeFormat("es", {
                day: "numeric",
                month: "short",
              }).format(new Date(progress.firstCommitAt))}.`
            : "Registra la primera evidencia para activar tu timeline."}
        </p>
      </AppCard>

      <Link href="/commit">
        <AppButton className="h-15 w-full text-base shadow-[0_22px_60px_var(--accent-glow)]">
          Registrar sesion
        </AppButton>
      </Link>
    </>
  );
}
