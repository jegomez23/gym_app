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
import type { SharedPresence } from "@/lib/presence/deriveSharedPresence";
import type { DerivedState } from "@/lib/state/deriveState";

import { SharedPresencePanel } from "./SharedPresencePanel";

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
  // Live shared-presence pacts (pending invitations + accepted, derived) — the
  // quiet "I'm not doing this alone" surface.
  sharedPresence: SharedPresence;
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
  chapter,
  memory,
}: {
  state: DerivedState["state"];
  name: string;
  identityStatement: string | null;
  chapter: string | null;
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
      // The steady, everyday state. When the person has named the season they
      // are in, the screen reflects it back in their own words (principle 13);
      // otherwise it holds the plain recognition. Never both.
      return (
        <>
          <p className="text-label uppercase text-secondary-text">
            Quien estás siendo
          </p>
          <h2 className="mt-3 text-display text-primary-text">
            Sigues apareciendo.
          </h2>
          {chapter ? (
            <>
              <p className="mt-4 max-w-80 text-body italic leading-7 text-primary-text">
                “{chapter}”
              </p>
              <p className="mt-3 max-w-80 text-body text-secondary-text">
                {name}, en eso estás ahora.
              </p>
            </>
          ) : (
            <p className="mt-3 max-w-80 text-body text-secondary-text">
              {name}, hoy no se trata de hacer más. Se trata de aparecer con
              intención.
            </p>
          )}
        </>
      );
  }
}

/**
 * Composition policy — the State Engine shapes the whole screen, not just the
 * hero words (STATE_SYSTEM.md Part 4 "Appears / Silent on", Part 5 priority).
 * Each state decides which blocks belong, what stays silent, and what leads.
 * The more vulnerable the state (Protected, Resting), the more silence wins; the
 * more relational (Supported), the more a person — never a number — comes first.
 */
type ScreenPolicy = {
  /** A push to act. Protected has none (silent on prompts). */
  cta: "primary" | "quiet" | "none";
  /** The human word is lifted above everything (Supported only). */
  supportLeads: boolean;
  circle: boolean;
  /** The last commit — the foundation in Returning, "other feedback" in Supported. */
  evidence: boolean;
  notifications: boolean;
  /** The support block where it does not already lead. */
  supportsTail: boolean;
};

const SCREEN_POLICY: Record<DerivedState["state"], ScreenPolicy> = {
  // An invitation and nothing else. Silent on all metrics, all memory.
  beginning: {
    cta: "primary",
    supportLeads: false,
    circle: false,
    evidence: false,
    notifications: true,
    supportsTail: false,
  },
  // The full steady screen: one anchor, the circle, the foundation, human words.
  building: {
    cta: "primary",
    supportLeads: false,
    circle: true,
    evidence: true,
    notifications: true,
    supportsTail: true,
  },
  // The sacred arrival: their words + their foundation. The gap and circle noise
  // stay quiet so nothing distracts from "la base sigue ahí".
  returning: {
    cta: "primary",
    supportLeads: false,
    circle: false,
    evidence: true,
    notifications: true,
    supportsTail: false,
  },
  // Reverence and restraint. Near-silence: the hero only, no push, nothing heavy.
  protected: {
    cta: "none",
    supportLeads: false,
    circle: false,
    evidence: false,
    notifications: false,
    supportsTail: false,
  },
  // The person and their words, undiluted, above everything else.
  supported: {
    cta: "primary",
    supportLeads: true,
    circle: true,
    evidence: false,
    notifications: true,
    supportsTail: false,
  },
  // An open, quiet door. No push, no feedback, no count. Just the way back.
  resting: {
    cta: "quiet",
    supportLeads: false,
    circle: false,
    evidence: false,
    notifications: false,
    supportsTail: false,
  },
};

function SupportsCard({
  recentSupports,
  profileId,
}: {
  recentSupports: Support[];
  profileId: string;
}) {
  return (
    <AppCard level="quiet">
      <p className="text-label uppercase text-secondary-text">Te acompañaron</p>
      <div className="mt-4 flex flex-col gap-3">
        {recentSupports.map((support) => (
          <div className="rounded-md bg-white/4 p-4" key={support.id}>
            <p className="text-caption leading-6 text-primary-text">
              {support.message}
            </p>
            <p className="mt-2 text-label uppercase text-secondary-text">
              {support.fromUserId === profileId ? "Lo enviaste tú" : "Para ti"}
            </p>
          </div>
        ))}
      </div>
    </AppCard>
  );
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
  sharedPresence,
}: TodayScreenProps) {
  const policy = SCREEN_POLICY[state.state];

  const latestCommit = commits[0];
  const pendingInvitations = memberships.filter(
    (membership) =>
      membership.status === "pending" && membership.invitedBy !== profile.id
  );

  const name = firstName(profile.name);

  const present = showedUpToday(presence);
  const anyRecent =
    presence.find((member) => member.lastCommitRecordedAt) ?? null;

  const hasSupports = recentSupports.length > 0;

  return (
    <>
      {/* Hero — the screen's single anchor: who you are becoming, not a number. */}
      <AppCard className="relative overflow-hidden" level="hero">
        <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-accent-soft blur-3xl" />
        <div className="relative">
          <TodayHero
            chapter={profile.chapter}
            identityStatement={profile.identityStatement}
            memory={memory}
            name={name}
            state={state.state}
          />

          {policy.cta !== "none" && (
            <Link className="mt-6 block" href="/commit">
              <AppButton
                className="w-full"
                variant={policy.cta === "quiet" ? "secondary" : undefined}
              >
                {policy.cta === "quiet"
                  ? "Cuando quieras, aparece"
                  : "Aparecer hoy"}
              </AppButton>
            </Link>
          )}
        </div>
      </AppCard>

      {/* Supported lifts the human word above everything — received, undiluted. */}
      {policy.supportLeads && hasSupports && (
        <SupportsCard profileId={profile.id} recentSupports={recentSupports} />
      )}

      {/* Shared presence rides the same state gate as other relational signals:
          never surfaced in the near-silent states (Protected, Resting). */}
      {policy.notifications && (
        <SharedPresencePanel
          active={sharedPresence.active}
          pending={sharedPresence.pending}
        />
      )}

      {policy.notifications && (
        <NotificationsPanel
          notifications={notifications}
          profileId={profile.id}
        />
      )}

      {policy.circle && (
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
      )}

      {policy.evidence && latestCommit ? (
        <DomainCommitCard commit={latestCommit} eyebrow="Tu última evidencia" />
      ) : null}

      {policy.supportsTail && hasSupports && (
        <SupportsCard profileId={profile.id} recentSupports={recentSupports} />
      )}
    </>
  );
}
