import Link from "next/link";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/features/auth/actions/logout";
import { DomainCommitCard } from "@/features/shared";
import type { JourneyItem, Profile } from "@/lib/dal";
import type { SelectedMemory } from "@/lib/memory/selectMemory";

import { DeleteAccountForm } from "./DeleteAccountForm";
import { ProfileEditForm } from "./ProfileEditForm";

type ProfileScreenProps = {
  profile: Profile;
  // A recent glimpse of the life this person is building — identity as evidence,
  // not a tally. The full record stays in the Archive.
  evidence: JourneyItem[];
  // One quiet sentence on the rhythm of the practice, or null when there is none
  // honest to claim yet.
  cadence: string | null;
  // The user's own origin — one of their oldest words, returned by the Memory
  // Selection Engine, or null for silence (the common case).
  memory: SelectedMemory | null;
};

function buildingSince(value: string) {
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

// The distance traveled, in plain words — never an exact count. Roughly: months
// once there is more than one, otherwise weeks.
function distanceSince(value: string) {
  const days = Math.floor(
    (Date.now() - new Date(value).getTime()) / 86_400_000
  );
  const months = Math.floor(days / 30);
  if (months >= 12) {
    const years = Math.floor(months / 12);
    return years === 1 ? "hace un año" : `hace ${years} años`;
  }
  if (months >= 2) {
    return `hace ${months} meses`;
  }
  if (months === 1) {
    return "hace un mes";
  }
  const weeks = Math.max(1, Math.floor(days / 7));
  return weeks === 1 ? "hace una semana" : `hace ${weeks} semanas`;
}

export function ProfileScreen({
  profile,
  evidence,
  cadence,
  memory,
}: ProfileScreenProps) {
  return (
    <>
      {/* The mirror: the user's own words first, the person who said them beneath. */}
      <AppCard level="hero">
        {profile.identityStatement ? (
          <p className="text-title leading-relaxed text-primary-text">
            “{profile.identityStatement}”
          </p>
        ) : (
          <div>
            <p className="text-title leading-relaxed text-secondary-text">
              Aún no has dicho en quién te estás convirtiendo.
            </p>
            <p className="mt-3 text-body text-secondary-text/80">
              Cuando quieras, deja una frase abajo. La app la recordará por ti.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center gap-4 border-t border-white/8 pt-6">
          <Avatar name={profile.name} size={56} src={profile.avatarUrl} />
          <div>
            <p className="text-body font-medium text-primary-text">
              {profile.name}
            </p>
            <p className="mt-0.5 text-caption text-secondary-text">
              @{profile.username ?? "pendiente"} · desde{" "}
              {buildingSince(profile.createdAt)}
            </p>
          </div>
        </div>
      </AppCard>

      {/* The mirror remembers: one of the user's own oldest words, returned by the
          Memory Selection Engine (Policy v2). The temporal arc of the portrait —
          where you started (here) → what you are living now (chapter) → the proof
          (evidence). Silent unless a reflection has aged into an origin; their own
          words lead, our framing is one quiet line of distance (Principle 13). */}
      {memory && (
        <section className="px-1">
          <p className="text-label uppercase text-accent">
            De tus primeras palabras
          </p>
          <p className="mt-3 text-title italic leading-relaxed text-primary-text">
            “{memory.content}”
          </p>
          {memory.createdAt && (
            <p className="mt-3 text-body text-secondary-text">
              Lo escribiste {distanceSince(memory.createdAt)}. Sigues siendo esa
              persona.
            </p>
          )}
        </section>
      )}

      {/* The present tense of the life: what they are living through right now, in
          their own words. The portrait reads in three movements — who you are
          becoming (hero), what you are living now (here), the proof (below). Shown
          only when it exists; the invitation to write one lives in the form. */}
      {profile.chapter && (
        <section className="px-1">
          <p className="text-label uppercase text-accent">Ahora</p>
          <p className="mt-3 text-title leading-relaxed text-primary-text">
            “{profile.chapter}”
          </p>
        </section>
      )}

      {/* Who is this person? The life they are building — their own evidence and
          its rhythm. Identity leads; this is the body of the page, not a tally.
          A glimpse only (the full record lives in the Archive). */}
      {evidence.length > 0 && (
        <section className="flex flex-col gap-4">
          <p className="px-1 text-label uppercase text-secondary-text">
            La vida que estás construyendo
          </p>
          {cadence && (
            <p className="px-1 text-body leading-7 text-secondary-text">
              {cadence}
            </p>
          )}
          {evidence.map((item) => (
            <DomainCommitCard commit={item} key={item.id} />
          ))}
          {/* The full record lives in the Archive, reached from here — the Profile
              is where your evidence already lives, so its complete history belongs
              under it, not in a top-level slot. */}
          <Link
            className="px-1 text-label uppercase text-secondary-text transition-colors hover:text-primary-text"
            href="/archive"
          >
            Ver todo el archivo →
          </Link>
        </section>
      )}

      {/* Settings recede beneath identity: the form reads directly on the page,
          its own first label the hierarchy — set apart by a hairline, not boxed. */}
      <div className="border-t border-white/8 pt-6">
        <ProfileEditForm profile={profile} />
      </div>

      {/* Account actions are set apart by a single hairline, not a container. */}
      <div className="border-t border-white/8 pt-6">
        <form action={logoutAction}>
          <AppButton className="w-full" type="submit" variant="secondary">
            Cerrar sesión
          </AppButton>
        </form>
        <DeleteAccountForm />
      </div>
    </>
  );
}
