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
  Support,
} from "@/lib/dal";
import type { SelectedMemory } from "@/lib/memory/selectMemory";
import type { DerivedState } from "@/lib/state/deriveState";

type TodayScreenProps = {
  profile: Profile;
  commits: Commit[];
  presence: CirclePresence[];
  memberships: CircleMembership[];
  recentSupports: Support[];
  notifications: Notification[];
  // The person's state is derived once, on the server. This screen consumes it.
  state: DerivedState;
  // At most one memory the Memory Selection Engine chose to return, or null.
  memory: SelectedMemory | null;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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

function TodayHero({
  state,
  name,
  identityStatement,
  memory,
}: {
  state: DerivedState["state"];
  name: string;
  identityStatement: string | null;
  memory: SelectedMemory | null;
}) {
  switch (state) {
    case "returning":
      // The sacred arrival: their own words, returned where they matter most. One
      // memory only — a selected past reflection when the engine returned one, else
      // the vow they wrote, else a plain warm line. Never two at once.
      return (
        <>
          <p className="text-label uppercase text-accent">
            Bienvenido de vuelta
          </p>
          <h2 className="mt-3 text-display text-primary-text">
            La base sigue ahí.
          </h2>
          {memory ? (
            <>
              <p className="mt-4 max-w-80 text-body italic leading-7 text-primary-text">
                “{memory.content}”
              </p>
              <p className="mt-3 max-w-80 text-body text-secondary-text">
                {name}, son tus palabras. Sigues siendo esa persona.
              </p>
            </>
          ) : identityStatement ? (
            <>
              <p className="mt-4 max-w-80 text-body italic leading-7 text-primary-text">
                “{identityStatement}”
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
      );
    case "beginning":
      return (
        <>
          <p className="text-label uppercase text-accent">Tu primer paso</p>
          <h2 className="mt-3 text-display text-primary-text">
            Empieza a dejar evidencia.
          </h2>
          <p className="mt-3 max-w-80 text-body text-secondary-text">
            {name}, la primera vez que apareces, el archivo empieza a recordar
            quién eres.
          </p>
        </>
      );
    case "protected":
      // Reverence and restraint: nothing heavy, nothing to prove. Just presence.
      return (
        <>
          <p className="text-label uppercase text-secondary-text">Estás aquí</p>
          <h2 className="mt-3 text-display text-primary-text">
            No hay nada que demostrar hoy.
          </h2>
          <p className="mt-3 max-w-80 text-body text-secondary-text">
            {name}, aparecer ya es suficiente. Tómate el tiempo que necesites.
          </p>
        </>
      );
    case "resting":
      // A pause, not a lapse. The door stays open without a word of pressure.
      return (
        <>
          <p className="text-label uppercase text-secondary-text">
            La puerta sigue abierta
          </p>
          <h2 className="mt-3 text-display text-primary-text">
            Cuando quieras, aquí sigue.
          </h2>
          <p className="mt-3 max-w-80 text-body text-secondary-text">
            {name}, descansar también es parte de esto. Nada se perdió.
          </p>
        </>
      );
    case "supported":
      // A human word arrived. Point toward the person, not a number.
      return (
        <>
          <p className="text-label uppercase text-accent">Te acompañaron</p>
          <h2 className="mt-3 text-display text-primary-text">
            Alguien te vio aparecer.
          </h2>
          <p className="mt-3 max-w-80 text-body text-secondary-text">
            {name}, no estás haciendo esto en silencio.
          </p>
        </>
      );
    case "building":
    default:
      return (
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
      );
  }
}

export function TodayScreen({
  profile,
  commits,
  presence,
  memberships,
  recentSupports,
  notifications,
  state,
  memory,
}: TodayScreenProps) {
  const latestCommit = commits[0];
  const pendingInvitations = memberships.filter(
    (membership) =>
      membership.status === "pending" && membership.invitedBy !== profile.id
  );

  const name = firstName(profile.name);
  // Protected is the one state where we hold back evidence of achievement.
  const isProtected = state.state === "protected";

  const present = showedUpToday(presence);
  const anyRecent =
    presence.find((member) => member.lastCommitRecordedAt) ?? null;

  return (
    <>
      {/* Hero — the screen's single anchor: who you are becoming, not a number. */}
      <AppCard className="relative overflow-hidden" level="hero">
        <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-accent-soft blur-3xl" />
        <div className="relative">
          <TodayHero
            identityStatement={profile.identityStatement}
            memory={memory}
            name={name}
            state={state.state}
          />

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

      {latestCommit && !isProtected ? (
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
