import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
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
    return "Sin evidencia reciente";
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
        <AppCard
          className="flex min-h-88 flex-col justify-between"
          level="hero"
        >
          <div>
            <p className="text-label uppercase text-accent">Círculo vacío</p>
            <h2 className="mt-4 text-title text-primary-text">
              Invita a alguien que entienda tu proceso.
            </h2>
            <p className="mt-3 text-body text-secondary-text">
              Busca por username e invita. La otra persona decide si entra. Sin
              prisa, sin presión.
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
      <AppCard level="hero">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label uppercase text-secondary-text">
              Círculo privado
            </p>
            <h2 className="mt-2 text-title text-primary-text">
              Presencia real
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border px-3 py-1.5 text-caption font-semibold text-accent">
            <Icon name="shield" size={13} />
            Privado
          </span>
        </div>
        <CircleInviteForm />
        <SupportFormClient members={presence} />
      </AppCard>

      {(incomingInvitations.length > 0 || outgoingInvitations.length > 0) && (
        <section className="mt-2">
          <p className="mb-3 text-label uppercase text-secondary-text">
            Invitaciones pendientes
          </p>
          <div className="flex flex-col gap-3">
            {incomingInvitations.map(({ membership, profile }) => (
              <AppCard key={membership.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-heading text-primary-text">
                      {profile?.name ?? "Invitación pendiente"}
                    </h3>
                    <p className="mt-1 text-caption text-secondary-text">
                      Quiere acompañarte en esto.
                    </p>
                  </div>
                  <span className="rounded-full border border-accent-border px-3 py-1 text-caption font-semibold text-accent">
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
                    <h3 className="text-heading text-primary-text">
                      {profile?.name ?? "Invitación enviada"}
                    </h3>
                    <p className="mt-1 text-caption text-secondary-text">
                      Esperando respuesta. Sin prisa.
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
          <p className="mb-3 text-label uppercase text-secondary-text">
            Miembros
          </p>
          <div className="flex flex-col gap-3">
            {activeMembers.map(({ membership, profile }) => (
              <AppCard key={membership.id} level="quiet">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={profile?.name ?? "Miembro"}
                      src={profile?.avatarUrl}
                    />
                    <div>
                      <h3 className="text-heading text-primary-text">
                        {profile?.name ?? "Miembro"}
                      </h3>
                      <p className="mt-0.5 text-caption text-secondary-text">
                        @{profile?.username ?? "circle"} · activo
                      </p>
                    </div>
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
        <p className="mb-3 text-label uppercase text-secondary-text">
          Presencia
        </p>
        <div className="flex flex-col gap-3">
          {presence.length > 0 ? (
            presence.map((member) => (
              <AppCard key={member.memberId} level="quiet">
                <div className="flex items-center gap-3">
                  <Avatar name={member.memberName} />
                  <div>
                    <h3 className="text-heading text-primary-text">
                      {member.memberName}
                    </h3>
                    <p className="mt-0.5 text-caption text-secondary-text">
                      {member.lastCommitTitle || "Apareció"} ·{" "}
                      {formatPresenceDate(member.lastCommitRecordedAt)}
                    </p>
                  </div>
                </div>
              </AppCard>
            ))
          ) : (
            <AppCard level="quiet">
              <p className="text-body text-secondary-text">
                Tu círculo está aquí. Todavía nadie ha aparecido hoy.
              </p>
            </AppCard>
          )}
        </div>
      </section>

      {recentSupports.length > 0 && (
        <section className="mt-2">
          <p className="mb-3 text-label uppercase text-secondary-text">
            Se acompañaron
          </p>
          <div className="flex flex-col gap-3">
            {recentSupports.map((support) => (
              <AppCard key={support.id}>
                <p className="text-body text-primary-text">{support.message}</p>
                <p className="mt-3 text-label uppercase text-secondary-text">
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
