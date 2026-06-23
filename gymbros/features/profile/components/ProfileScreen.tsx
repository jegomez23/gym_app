import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { Icon } from "@/components/ui/Icon";
import { StatBlock } from "@/components/ui/StatBlock";
import { logoutAction } from "@/features/auth/actions/logout";
import type { CircleMembership, Profile, ProgressSummary } from "@/lib/dal";

import { DeleteAccountForm } from "./DeleteAccountForm";
import { ProfileEditForm } from "./ProfileEditForm";

type ProfileScreenProps = {
  profile: Profile;
  progress: ProgressSummary;
  memberships: CircleMembership[];
};

const productPrinciples = [
  "Sin feed público",
  "Sin métricas de vanidad",
  "Sin comparación corporal",
  "Evidencia sobre obsesión",
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildingSince(value: string) {
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileScreen({
  profile,
  progress,
  memberships,
}: ProfileScreenProps) {
  return (
    <>
      <AppCard level="hero">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-title font-semibold text-accent">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="h-full w-full rounded-full object-cover"
                src={profile.avatarUrl}
              />
            ) : (
              initials(profile.name) || "GC"
            )}
          </div>
          <div>
            <h2 className="text-title text-primary-text">{profile.name}</h2>
            <p className="mt-1 text-caption text-secondary-text">
              @{profile.username ?? "pendiente"} · desde{" "}
              {buildingSince(profile.createdAt)}
            </p>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-5 text-body leading-7 text-primary-text">
            {profile.bio}
          </p>
        )}
        <div className="mt-6">
          <StatBlock label="Evidencias" value={progress.totalCommits} />
        </div>
      </AppCard>

      <AppCard level="quiet">
        <p className="text-label uppercase text-secondary-text">
          Editar perfil
        </p>
        <ProfileEditForm profile={profile} />
      </AppCard>

      <AppCard level="quiet">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-label uppercase text-secondary-text">
              Círculo privado
            </p>
            <h2 className="mt-2 text-heading text-primary-text">
              {memberships.length}{" "}
              {memberships.length === 1 ? "persona" : "personas"} contigo
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border px-3 py-1 text-caption font-semibold text-accent">
            <Icon name="shield" size={13} />
            Privado
          </span>
        </div>
      </AppCard>

      <AppCard level="quiet">
        <p className="text-label uppercase text-secondary-text">
          Principios del producto
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {productPrinciples.map((principle) => (
            <li
              className="flex items-center gap-3 text-body text-primary-text"
              key={principle}
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              {principle}
            </li>
          ))}
        </ul>
        <form action={logoutAction}>
          <AppButton className="mt-6 w-full" type="submit" variant="secondary">
            Cerrar sesión
          </AppButton>
        </form>
        <DeleteAccountForm />
      </AppCard>
    </>
  );
}
