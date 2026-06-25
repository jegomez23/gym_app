import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/features/auth/actions/logout";
import type { Profile } from "@/lib/dal";

import { DeleteAccountForm } from "./DeleteAccountForm";
import { ProfileEditForm } from "./ProfileEditForm";

type ProfileScreenProps = {
  profile: Profile;
};

function buildingSince(value: string) {
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileScreen({ profile }: ProfileScreenProps) {
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

      {/* The form reads directly on the page — its own first label is the
          hierarchy. No card, no "Editar perfil" heading boxing it in. */}
      <ProfileEditForm profile={profile} />

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
