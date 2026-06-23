import { AppCard } from "@/components/ui/AppCard";
import { StatBlock } from "@/components/ui/StatBlock";
import type {
  CircleMembership,
  CirclePresence,
  Profile,
  Support,
} from "@/lib/dal";

import { CircleInviteForm } from "./CircleInviteForm";
import { CircleMemberActionForm } from "./CircleMemberActionForm";
import { CircleRealtimeClient } from "./CircleRealtimeClient";
import { SupportFormClient } from "./SupportFormClient";

type CircleScreenProps = {
  currentProfileId: string;
  memberships: CircleMembership[];
  memberProfiles: Array<{
    membership: CircleMembership;
    profile: Profile | null;
  }>;
  presence: CirclePresence[];
  recentSupports: Support[];
};

function formatPresenceDate(value: string | null) {
  if (!value) {
    return "Sin commit reciente";
  }

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function CircleScreen({
  currentProfileId,
  memberships,
  memberProfiles,
  presence,
  recentSupports,
}: CircleScreenProps) {
  const activeMemberships = memberships.filter(
    (membership) => membership.status === "active"
  );
  const incomingInvitations = memberProfiles.filter(
    ({ membership }) =>
      membership.status === "pending" &&
      membership.invitedBy !== currentProfileId
  );
  const outgoingInvitations = memberProfiles.filter(
    ({ membership }) =>
      membership.status === "pending" &&
      membership.invitedBy === currentProfileId
  );
  const activeMembers = memberProfiles.filter(
    ({ membership }) => membership.status === "active"
  );

  if (memberships.length === 0) {
    return (
      <>
        <CircleRealtimeClient profileId={currentProfileId} />
        <AppCard className="flex min-h-[22rem] flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Circulo vacio
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-primary-text">
              Invita a alguien que entienda tu proceso.
            </h2>
            <p className="mt-3 text-sm leading-6 text-secondary-text">
              Busca por username. Las relaciones empiezan pendientes y solo se
              activan cuando la otra persona acepta.
            </p>
          </div>
          <CircleInviteForm />
        </AppCard>
      </>
    );
  }

  return (
    <>
      <CircleRealtimeClient profileId={currentProfileId} />
      <AppCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
              Circulo privado
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-primary-text">
              Presencia real
            </h2>
          </div>
          <span className="rounded-full border border-[var(--accent-border)] px-4 py-2 text-xs font-semibold text-accent">
            Privado
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatBlock label="Miembros" value={memberships.length} />
          <StatBlock label="Activos" value={activeMemberships.length} />
          <StatBlock label="Con presencia" value={presence.length} />
        </div>
        <CircleInviteForm />
        <SupportFormClient members={presence} />
      </AppCard>

      {(incomingInvitations.length > 0 || outgoingInvitations.length > 0) && (
        <section className="mt-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Invitaciones pendientes
          </p>
          <div className="flex flex-col gap-3">
            {incomingInvitations.map(({ membership, profile }) => (
              <AppCard key={membership.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-text">
                      {profile?.name ?? "Invitacion pendiente"}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-text">
                      Quiere entrar en tu Circle.
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--accent-border)] px-3 py-1 text-xs font-semibold text-accent">
                    Nueva
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <CircleMemberActionForm
                    memberId={membership.circleUserId}
                    mode="accept"
                  />
                  <CircleMemberActionForm
                    memberId={membership.circleUserId}
                    mode="reject"
                  />
                </div>
              </AppCard>
            ))}
            {outgoingInvitations.map(({ membership, profile }) => (
              <AppCard key={membership.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-text">
                      {profile?.name ?? "Invitacion enviada"}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-text">
                      Esperando aceptacion. Sin presion, sin feed.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <CircleMemberActionForm
                    memberId={membership.circleUserId}
                    mode="cancel"
                  />
                </div>
              </AppCard>
            ))}
          </div>
        </section>
      )}

      {activeMembers.length > 0 && (
        <section className="mt-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Miembros
          </p>
          <div className="flex flex-col gap-3">
            {activeMembers.map(({ membership, profile }) => (
              <AppCard key={membership.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-text">
                      {profile?.name ?? "Miembro"}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-text">
                      @{profile?.username ?? "circle"} · activo
                    </p>
                  </div>
                  <CircleMemberActionForm
                    memberId={membership.circleUserId}
                    mode="leave"
                  />
                </div>
              </AppCard>
            ))}
          </div>
        </section>
      )}

      <section className="mt-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
          Actividad reciente
        </p>
        <div className="flex flex-col gap-3">
          {presence.length > 0 ? (
            presence.map((member) => (
              <AppCard key={member.memberId}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-text">
                      {member.memberName}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-text">
                      {member.lastCommitTitle || "Sin titulo publico"}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/8 px-3 py-1 text-xs font-semibold text-secondary-text">
                    {member.activeCommitCount}
                  </span>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-text">
                  {formatPresenceDate(member.lastCommitRecordedAt)}
                </p>
              </AppCard>
            ))
          ) : (
            <AppCard>
              <p className="text-sm leading-6 text-secondary-text">
                Hay miembros conectados, pero aun no hay commits compartidos
                recientes.
              </p>
            </AppCard>
          )}
        </div>
      </section>

      {recentSupports.length > 0 && (
        <section className="mt-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-text">
            Apoyos recientes
          </p>
          <div className="flex flex-col gap-3">
            {recentSupports.map((support) => (
              <AppCard key={support.id}>
                <p className="text-sm leading-6 text-primary-text">
                  {support.message}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-secondary-text">
                  {support.fromUserId === currentProfileId
                    ? "Enviado"
                    : "Recibido"}
                </p>
              </AppCard>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
