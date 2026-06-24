import Link from "next/link";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
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

const MS_PER_DAY = 1000 * 60 * 60 * 24;
// A pause long enough that the return deserves to be welcomed, not measured.
const RETURN_AFTER_DAYS = 4;

function firstName(name: string) {
  return name.trim().split(" ")[0] || name;
}

function daysSince(value: string | null) {
  if (!value) {
    return null;
  }

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return null;
  }

  return Math.floor((Date.now() - then) / MS_PER_DAY);
}

function showedUpToday(presence: CirclePresence[]) {
  return presence.filter(
    (member) => daysSince(member.lastCommitRecordedAt) === 0
  );
}

function presenceLine(
  present: CirclePresence[],
  anyRecent: CirclePresence | null
) {
  if (present.length === 1) {
    return `${firstName(present[0].memberName)} apareció hoy.`;
  }

  if (present.length === 2) {
    return `${firstName(present[0].memberName)} y ${firstName(present[1].memberName)} aparecieron hoy.`;
  }

  if (present.length > 2) {
    return `${firstName(present[0].memberName)}, ${firstName(present[1].memberName)} y otros aparecieron hoy.`;
  }

  if (anyRecent) {
    return `${firstName(anyRecent.memberName)} apareció hace poco.`;
  }

  return "Tu círculo está en silencio. Hoy puedes empezar tú.";
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

  const name = firstName(profile.name);
  const gap = daysSince(progress.lastCommitAt);
  const isReturning =
    progress.totalCommits > 0 && gap !== null && gap >= RETURN_AFTER_DAYS;
  const isFirstTime = progress.totalCommits === 0;

  const present = showedUpToday(presence);
  const anyRecent =
    presence.find((member) => member.lastCommitRecordedAt) ?? null;

  return (
    <>
      {/* Hero — the screen's single anchor: who you are becoming, not a number. */}
      <AppCard className="relative overflow-hidden" level="hero">
        <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-accent-soft blur-3xl" />
        <div className="relative">
          {isReturning ? (
            <>
              <p className="text-label uppercase text-accent">
                Bienvenido de vuelta
              </p>
              <h2 className="mt-3 text-display text-primary-text">
                La base sigue ahí.
              </h2>
              {profile.identityStatement ? (
                <>
                  {/* Their own words, returned at the moment they matter most. */}
                  <p className="mt-4 max-w-80 text-body italic leading-7 text-primary-text">
                    “{profile.identityStatement}”
                  </p>
                  <p className="mt-3 max-w-80 text-body text-secondary-text">
                    {name}, sigues siendo esa persona.
                  </p>
                </>
              ) : (
                <p className="mt-3 max-w-80 text-body text-secondary-text">
                  {name}, no empezamos de cero. Sigues siendo quien estabas
                  eligiendo ser.
                </p>
              )}
            </>
          ) : isFirstTime ? (
            <>
              <p className="text-label uppercase text-accent">Tu primer paso</p>
              <h2 className="mt-3 text-display text-primary-text">
                Empieza a dejar evidencia.
              </h2>
              <p className="mt-3 max-w-80 text-body text-secondary-text">
                {name}, la primera vez que apareces, el archivo empieza a
                recordar quién eres.
              </p>
            </>
          ) : (
            <>
              <p className="text-label uppercase text-secondary-text">
                Quien estás siendo
              </p>
              <h2 className="mt-3 text-display text-primary-text">
                Sigues apareciendo.
              </h2>
              <p className="mt-3 max-w-80 text-body text-secondary-text">
                {name}, hoy no se trata de hacer más. Se trata de aparecer con
                intención.
              </p>
            </>
          )}

          <Link className="mt-6 block" href="/commit">
            <AppButton className="w-full">Aparecer hoy</AppButton>
          </Link>
        </div>
      </AppCard>

      <NotificationsPanel
        notifications={notifications}
        profileId={profile.id}
      />

      <AppCard level="quiet">
        <p className="text-label uppercase text-secondary-text">Tu círculo</p>
        <div className="mt-3 flex items-center gap-3">
          {present.length > 0 && (
            <div className="flex -space-x-2">
              {present.slice(0, 3).map((member) => (
                <Avatar
                  className="ring-2 ring-[var(--surface)]"
                  key={member.memberId}
                  name={member.memberName}
                  size={32}
                  src={member.memberAvatarUrl}
                />
              ))}
            </div>
          )}
          <p className="text-body text-primary-text">
            {presenceLine(present, anyRecent)}
          </p>
        </div>
        {pendingInvitations.length > 0 && (
          <Link className="mt-4 block" href="/circle">
            <AppButton className="w-full" variant="secondary">
              {pendingInvitations.length === 1
                ? "Alguien quiere acompañarte"
                : "Algunas personas quieren acompañarte"}
            </AppButton>
          </Link>
        )}
      </AppCard>

      {latestCommit ? (
        <DomainCommitCard commit={latestCommit} eyebrow="Tu última evidencia" />
      ) : null}

      {recentSupports.length > 0 && (
        <AppCard level="quiet">
          <p className="text-label uppercase text-secondary-text">
            Te acompañaron
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {recentSupports.map((support) => (
              <div
                className="rounded-md border border-white/8 bg-white/3 p-4"
                key={support.id}
              >
                <p className="text-caption leading-6 text-primary-text">
                  {support.message}
                </p>
                <p className="mt-2 text-label uppercase text-secondary-text">
                  {support.fromUserId === profile.id
                    ? "Lo enviaste tú"
                    : "Para ti"}
                </p>
              </div>
            ))}
          </div>
        </AppCard>
      )}
    </>
  );
}
