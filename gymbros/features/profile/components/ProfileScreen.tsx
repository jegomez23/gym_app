import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/features/auth/actions/logout";
import { DomainCommitCard } from "@/features/shared";
import type { JourneyItem, Profile } from "@/lib/dal";

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
};

function buildingSince(value: string) {
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileScreen({
  profile,
  evidence,
  cadence,
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
